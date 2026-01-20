'use client';

import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import type { Form } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FormViewer } from '@/components/form-viewer';

export default function ViewFormPage() {
    const firestore = useFirestore();
    const params = useParams();
    const formId = params.formId as string;

    const formRef = useMemoFirebase(() => {
        if (!formId) return null;
        return doc(firestore, `forms/${formId}`);
    }, [firestore, formId]);

    const { data: formData, isLoading } = useDoc<Omit<Form, 'id'>>(formRef);

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
       <div className="py-8">
         <FormViewer form={{ ...formData, id: formId }} />
       </div>
    );
}
