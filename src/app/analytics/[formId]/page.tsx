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
import type { Form, FormResponse } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function FormAnalyticsPage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const params = useParams();
    const formId = params.formId as string;

    const formRef = useMemoFirebase(() => {
        if (!formId) return null;
        return doc(firestore, `forms/${formId}`);
    }, [firestore, formId]);

    const responsesRef = useMemoFirebase(() => {
        if(!formId) return null;
        return collection(firestore, `forms/${formId}/responses`);
    }, [firestore, formId]);

    const { data: formData, isLoading: isFormLoading } = useDoc<Omit<Form, 'id'>>(formRef);
    const { data: responses, isLoading: areResponsesLoading } = useCollection<Omit<FormResponse, 'id'>>(responsesRef);

    if (isFormLoading || areResponsesLoading) {
        return (
            <AuthGuard>
                <div className="flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-72 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(3)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </AuthGuard>
        );
    }
    
    // Authorization check
    if (!isFormLoading && formData && user && formData.userId !== user.uid) {
        return <AuthGuard><div>You are not authorized to view these analytics.</div></AuthGuard>;
    }

    if (!formData) {
        return <AuthGuard><div>Form not found.</div></AuthGuard>;
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
