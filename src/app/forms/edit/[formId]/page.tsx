'use client';

import { AuthGuard } from "@/components/auth-guard";
import { FormBuilder } from "@/components/form-builder";
import { useAuth } from "@/firebase/auth/use-auth";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import type { Form } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function EditForm() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const params = useParams();
    const formId = params.formId as string;

    const formRef = useMemoFirebase(() => {
        if (!formId) return null;
        return doc(firestore, `forms/${formId}`);
    }, [firestore, formId]);

    const { data: formData, isLoading } = useDoc<Omit<Form, 'id'>>(formRef);
    
    // Authorization check
    if (!isLoading && formData && user && formData.userId !== user.uid) {
        return <div>You are not authorized to edit this form.</div>;
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <Skeleton className="h-10 w-1/2 mb-4" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardContent className="pt-6 space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6 lg:sticky top-24">
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        );
    }

    if (!formData) {
        return <div>Form not found.</div>;
    }

    return <FormBuilder initialData={{ ...formData, id: formId }} />;
}


export default function EditFormPage() {
    return (
        <AuthGuard>
            <EditForm />
        </AuthGuard>
    );
}
