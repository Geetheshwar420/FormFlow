'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/firebase/auth/use-auth";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import type { Form, FormResponse, Question } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

// Helper function to generate colors for charts
const generateChartColors = (numColors: number) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(`hsl(var(--chart-${(i % 5) + 1}))`);
    }
    return colors;
};

// Component to render a chart for a specific question
const QuestionAnalytics = ({ question, data }: { question: Question, data: any[] }) => {
    const chartColors = useMemo(() => generateChartColors(data.length), [data]);

    const chartConfig = useMemo(() => {
        const config: ChartConfig = {};
        if (['multiple-choice', 'checkboxes', 'rating'].includes(question.type)) {
            data.forEach((item, index) => {
                if(typeof item === 'object' && item !== null && 'name' in item)
                config[item.name as string] = {
                    label: item.name as string,
                    color: chartColors[index],
                };
            });
        }
        return config;
    }, [data, question.type, chartColors]);

    if (!data || data.length === 0) {
        return <p className="text-muted-foreground">No responses to analyze for this question yet.</p>;
    }
    
    switch (question.type) {
        case 'multiple-choice':
        case 'checkboxes':
        case 'rating':
            if (data.length === 0) {
                 return <p className="text-muted-foreground">No responses to analyze for this question yet.</p>;
            }
            return (
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={data}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                             {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            );

        case 'text':
        case 'textarea':
             return (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Response</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(data as string[]).slice(0, 5).map((answer, index) => (
                            <TableRow key={index}>
                                <TableCell>{answer}</TableCell>
                            </TableRow>
                        ))}
                        {data.length > 5 && (
                             <TableRow>
                                <TableCell colSpan={1} className="text-center text-muted-foreground">
                                    ...and {data.length - 5} more responses
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            );

        default:
            return <p className="text-muted-foreground">Analytics for this question type are not yet available.</p>;
    }
};


export default function FormAnalyticsPage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const params = useParams();
    const formId = params.formId as string;

    const [filters, setFilters] = useState<Record<string, string>>({});

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

    const { data: formData, isLoading: isFormLoading } = useDoc<Omit<Form, 'id'>>(formRef);

    const responsesRef = useMemoFirebase(() => {
        if(!formId || !lookupData?.ownerId) return null;
        return collection(firestore, `users/${lookupData.ownerId}/forms/${formId}/responses`);
    }, [firestore, formId, lookupData]);

    const { data: responses, isLoading: areResponsesLoading } = useCollection<FormResponse>(responsesRef);


    const filteredResponses = useMemo(() => {
        if (!responses) return [];
        if (Object.keys(filters).length === 0 || Object.values(filters).every(v => !v)) return responses;

        return responses.filter(response => {
            return Object.entries(filters).every(([questionId, filterValue]) => {
                if (!filterValue) return true; // 'All' option selected
                const answer = response.answers.find(a => a.questionId === questionId);
                return answer && String(answer.value) === filterValue;
            });
        });
    }, [responses, filters]);

    const analyticsData = useMemo(() => {
        if (!formData || !filteredResponses) {
            return {};
        }

        // Initialize data structures
        const dataByQuestion: { [key: string]: any } = {};
        const questionMap: Map<string, Question> = new Map(formData.questions.map(q => [q.id, q]));

        formData.questions.forEach(question => {
            const questionType = question.type;
            if (questionType === 'multiple-choice' || questionType === 'checkboxes' || questionType === 'rating') {
                dataByQuestion[question.id] = {}; // Use an object for counts: { option: count }
            } else {
                dataByQuestion[question.id] = []; // Use an array for raw text answers
            }
        });

        // Single pass over all responses to aggregate answers
        for (const response of filteredResponses) {
            for (const answer of response.answers) {
                const question = questionMap.get(answer.questionId);
                if (!question) continue;

                const { questionId, value } = answer;
                const questionType = question.type;

                if (questionType === 'multiple-choice' || questionType === 'rating') {
                    const stringValue = String(value);
                    dataByQuestion[questionId][stringValue] = (dataByQuestion[questionId][stringValue] || 0) + 1;
                } else if (questionType === 'checkboxes' && Array.isArray(value)) {
                    for (const option of value) {
                        dataByQuestion[questionId][option] = (dataByQuestion[questionId][option] || 0) + 1;
                    }
                } else if ((questionType === 'text' || questionType === 'textarea') && value) {
                    (dataByQuestion[questionId] as any[]).push(value);
                }
            }
        }

        // Final transformation into array format required by charts
        for (const question of formData.questions) {
            const questionType = question.type;
            if (questionType === 'multiple-choice' || questionType === 'checkboxes' || questionType === 'rating') {
                dataByQuestion[question.id] = Object.entries(dataByQuestion[question.id]).map(([name, value]) => ({ name, value }));
            }
        }

        return dataByQuestion;
    }, [formData, filteredResponses]);


    const handleFilterChange = (questionId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [questionId]: value === 'all' ? '' : value,
        }));
    };

    const handleExport = (format: 'csv' | 'json' | 'pdf') => {
        if (!filteredResponses || filteredResponses.length === 0 || !formData) return;

        const dataToExport = filteredResponses.map(res => {
            const row: Record<string, any> = {
                responseId: res.id,
                submittedAt: res.submittedAt,
            };
            formData.questions.forEach(q => {
                const answer = res.answers.find(a => a.questionId === q.id);
                row[q.text] = answer ? (Array.isArray(answer.value) ? answer.value.join(', ') : answer.value) : '';
            });
            return row;
        });

        if (format === 'json') {
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `${formData.title}-responses.json`;
            link.click();
        } else if (format === 'csv') {
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${formData.title}-responses.csv`);
            link.click();
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text(`${formData.title} - Responses`, 14, 16);
            autoTable(doc, {
                head: [Object.keys(dataToExport[0] || {})],
                body: dataToExport.map(row => Object.values(row)),
                startY: 22
            });
            doc.save(`${formData.title}-responses.pdf`);
        }
    };
    
    const filterableQuestions = useMemo(() => {
        return formData?.questions.filter(q => q.type === 'multiple-choice' || q.type === 'rating') || [];
    }, [formData]);


    const isLoading = isLookupLoading || isFormLoading || areResponsesLoading;
    
    if (isLoading) {
        return (
            <AuthGuard>
                <div className="flex flex-col gap-8">
                     <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10" />
                        <div>
                            <Skeleton className="h-7 w-48 mb-2" />
                            <Skeleton className="h-4 w-72" />
                        </div>
                    </div>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardHeader>
                        <CardContent>
                           <div className="flex justify-between items-center">
                             <div className="flex gap-4">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                           </div>
                        </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                           <Card key={i}>
                                <CardHeader>
                                    <Skeleton className="h-6 w-2/3" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-40 w-full" />
                                </CardContent>
                           </Card>
                        ))}
                    </div>
                </div>
            </AuthGuard>
        );
    }
    
    if (!isLoading && formData && user && formData.userId !== user.uid) {
        return <AuthGuard><div>You are not authorized to view these analytics.</div></AuthGuard>;
    }

    if (!formData) {
        return <AuthGuard><div>Form not found.</div></AuthGuard>;
    }

    return (
        <AuthGuard>
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                    <Link href="/analytics">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold font-headline">Form Analytics</h1>
                        <p className="text-muted-foreground text-sm">Detailed insights for your form.</p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">{formData.title}</CardTitle>
                        <CardDescription>{formData.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex gap-4">
                                <Badge variant="secondary">Total Responses: {responses?.length || 0}</Badge>
                                 <Badge variant="secondary">Filtered: {filteredResponses.length}</Badge>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Data</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleExport('json')}>Export as JSON</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>
                
                {filterableQuestions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Filter Results</CardTitle>
                            <CardDescription>Filter responses based on answers to specific questions.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filterableQuestions.map(q => (
                                <div key={q.id} className="space-y-2">
                                    <label className="text-sm font-medium">{q.text}</label>
                                    <Select onValueChange={(value) => handleFilterChange(q.id, value)} value={filters[q.id] || 'all'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {q.options?.map(opt => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                            {q.type === 'rating' && [1,2,3,4,5].map(opt => (
                                                <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {formData.questions.map((question, index) => (
                       <Card key={question.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms`}}>
                           <CardHeader>
                               <CardTitle>{question.text}</CardTitle>
                           </CardHeader>
                           <CardContent>
                               <QuestionAnalytics question={question} data={analyticsData[question.id] || []} />
                           </CardContent>
                       </Card>
                   ))}
                </div>
            </div>
        </AuthGuard>
    );
}

    