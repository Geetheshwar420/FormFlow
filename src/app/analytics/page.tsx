'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/firebase/auth/use-auth";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import type { Form, FormResponse } from "@/lib/types";
import { ArrowLeft, BarChart, FileText, CheckSquare } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export default function AnalyticsPage() {
    const { user } = useAuth();
    const firestore = useFirestore();

    const formsCollection = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'forms') : null, [firestore, user]);
    const { data: forms, isLoading: formsLoading } = useCollection<Omit<Form, 'id'>>(formsCollection);

    // Calculate total responses by querying all response counts from forms
    const totalResponses = useMemo(() => {
        if (!forms) return 0;
        return forms.reduce((acc, form) => {
            return acc + (form.responseCount || 0);
        }, 0);
    }, [forms]);

    const isLoading = formsLoading;

    if (isLoading) {
        return (
            <AuthGuard>
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10" />
                        <div>
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-80 mt-2" />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-12" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-28" />
                                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-12" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-40" />
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-12" />
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-72 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="p-4 rounded-lg border">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-24 mt-2" />
                                </div>
                                <div className="p-4 rounded-lg border">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-20 mt-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AuthGuard>
        );
    }

    const totalForms = forms?.length || 0;

    return (
        <AuthGuard>
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-headline tracking-tight">
                            Analytics Overview
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            A summary of your forms performance.
                        </p>
                    </div>
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

    