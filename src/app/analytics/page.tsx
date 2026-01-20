'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/firebase/auth/use-auth";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import type { Form } from "@/lib/types";
import { BarChart, FileText, CheckSquare } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
    const { user } = useAuth();
    const firestore = useFirestore();

    const formsCollection = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/forms`) : null, [firestore, user]);
    const { data: forms, isLoading } = useCollection<Omit<Form, 'id'>>(formsCollection);

    if (isLoading) {
        return <div>Loading analytics...</div>;
    }

    const totalForms = forms?.length || 0;
    const totalResponses = forms?.reduce((acc, form) => acc + (form.responseCount || 0), 0) || 0;

    return (
        <AuthGuard>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">
                        Analytics Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        A summary of your forms performance.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalForms}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                            <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalResponses}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Responses/Form</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{(totalForms > 0 ? totalResponses / totalForms : 0).toFixed(1)}</div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>All Forms</CardTitle>
                        <CardDescription>
                            Select a form to see detailed analytics.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {forms && forms.length > 0 ? forms.map(form => (
                                <Link href={`/analytics/${form.id}`} key={form.id} className="block hover:bg-muted/50 p-4 rounded-lg border">
                                    <h3 className="font-semibold">{form.title}</h3>
                                    <p className="text-sm text-muted-foreground">{form.responseCount || 0} responses</p>
                                </Link>
                            )) : <p>No forms created yet.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthGuard>
    );
}
