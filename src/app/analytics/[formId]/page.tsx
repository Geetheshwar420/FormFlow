'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/firebase/auth/use-auth";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import type { Form } from "@/lib/types";

// Assuming a Response type
type FormResponse = {
    id: string;
    submittedAt: string;
    // other fields from your Response entity
}

export default function FormAnalyticsPage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const params = useParams();
    const formId = params.formId as string;

    const formRef = useMemoFirebase(() => {
        if (!user || !formId) return null;
        return doc(firestore, `users/${user.uid}/forms/${formId}`);
    }, [firestore, user, formId]);

    const responsesRef = useMemoFirebase(() => {
        if(!user || !formId) return null;
        return collection(firestore, `users/${user.uid}/forms/${formId}/responses`);
    }, [firestore, user, formId]);

    const { data: formData, isLoading: isFormLoading } = useDoc<Omit<Form, 'id'>>(formRef);
    const { data: responses, isLoading: areResponsesLoading } = useCollection<Omit<FormResponse, 'id'>>(responsesRef);

    if (isFormLoading || areResponsesLoading) {
        return <div>Loading analytics...</div>;
    }

    if (!formData) {
        return <div>Form not found.</div>;
    }

    return (
        <AuthGuard>
            <div className="flex flex-col gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold font-headline tracking-tight">{formData.title}</CardTitle>
                        <CardDescription>{formData.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Badge variant="secondary">Responses: {responses?.length || 0}</Badge>
                            <Badge variant="secondary">Created: {new Date(formData.createdAt).toLocaleDateString()}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Responses</CardTitle>
                        <CardDescription>A list of all submissions for this form.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Response ID</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {responses && responses.length > 0 ? (
                                    responses.map(response => (
                                        <TableRow key={response.id}>
                                            <TableCell className="font-mono">{response.id}</TableCell>
                                            <TableCell>{new Date(response.submittedAt).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">No responses yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AuthGuard>
    );
}
