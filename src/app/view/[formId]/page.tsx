'use client';

import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import type { Form } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FormViewer } from '@/components/form-viewer';
import { useAuth } from '@/firebase/auth/use-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ViewFormPage() {
    const firestore = useFirestore();
    const params = useParams();
    const formId = params.formId as string;
    const { user, isUserLoading } = useAuth();

    // 2-step fetch: Get lookup first, then the form
    const lookupRef = useMemoFirebase(() => {
        if (!formId) return null;
        return doc(firestore, 'form_lookups', formId);
    }, [firestore, formId]);

    const { data: lookupData, isLoading: isLookupLoading } = useDoc<{ownerId: string}>(lookupRef);

    const formRef = useMemoFirebase(() => {
        if (!formId || !lookupData?.ownerId) return null;
        return doc(firestore, 'users', lookupData.ownerId, 'forms', formId);
    }, [firestore, formId, lookupData]);

    const { data: formData, isLoading: isFormLoading } = useDoc<Form>(formRef);

    const isLoading = isLookupLoading || isFormLoading || isUserLoading;

    const isOwner = !isLoading && user && formData && user.uid === formData.userId;


    if (isLoading) {
        return (
             <div className="max-w-3xl mx-auto p-4">
                <div className="space-y-8">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-10 w-1/2" />
                        </div>
                    </div>
                </div>
             </div>
        );
    }

    if (!formData) {
        return <div className="text-center mt-10">Form not found or you do not have permission to view it.</div>;
    }

    return (
       <div className="py-8 relative">
         <FormViewer form={formData} />
         {isOwner && (
            <Link href="/dashboard" passHref>
                <Button variant="secondary" className="fixed bottom-5 right-5 z-10 shadow-lg">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </Link>
         )}
       </div>
    );
}

    