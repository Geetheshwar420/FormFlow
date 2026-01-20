'use client';

import { FormBuilder } from "@/components/form-builder";
import { useAuth } from "@/firebase/auth/use-auth";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import type { Form } from '@/lib/types';

export default function EditFormPage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const params = useParams();
    const formId = params.formId as string;

    const formRef = useMemoFirebase(() => {
        if (!user || !formId) return null;
        return doc(firestore, `users/${user.uid}/forms/${formId}`);
    }, [firestore, user, formId]);

    const { data: formData, isLoading } = useDoc<Omit<Form, 'id'>>(formRef);

    if (isLoading) {
        return <div>Loading form...</div>;
    }

    if (!formData) {
        return <div>Form not found.</div>;
    }

    return <FormBuilder initialData={{ ...formData, id: formId }} />;
}
