
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Question } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/firebase/auth/use-auth";

interface FormViewerProps {
    form: Form;
    isPreview?: boolean;
}

export function FormViewer({ form, isPreview = false }: FormViewerProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, signOut } = useAuth();

    const handleValueChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPreview) return;

        if (form.requiresSignIn && !user) {
            toast({
                title: "Authentication Required",
                description: "You must sign in to submit this form.",
                variant: "destructive"
            });
            router.push(`/login?redirect=/view/${form.id}`);
            return;
        }

        setIsSubmitting(true);
        try {
            const responsesCollection = collection(firestore, `users/${form.userId}/forms/${form.id}/responses`);
            const responsePayload = {
                formId: form.id,
                formOwnerId: form.userId,
                submittedAt: new Date().toISOString(),
                answers: Object.entries(answers).map(([questionId, value]) => ({
                    questionId,
                    value,
                }))
            };
            await addDocumentNonBlocking(responsesCollection, responsePayload);
            
            // Increment response count on the form document
            const formRef = doc(firestore, `users/${form.userId}/forms/${form.id}`);
            await setDocumentNonBlocking(formRef, { responseCount: increment(1) }, { merge: true });
            
            toast({
                title: "Response submitted!",
                description: "Thank you for filling out the form.",
            });
            setAnswers({});
            router.push(user ? "/dashboard" : "/");
        } catch (error) {
            console.error("Error submitting response:", error);
            toast({
                title: "Error",
                description: "There was an error submitting your response.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSwitchAccount = async () => {
        await signOut();
    };


    const renderQuestion = (question: Question) => {
        const questionId = question.id;
        switch (question.type) {
            case 'text':
                return <Input
                    required={question.required}
                    value={answers[questionId] || ''}
                    onChange={(e) => handleValueChange(questionId, e.target.value)}
                />;
            case 'textarea':
                return <Textarea
                    required={question.required}
                    value={answers[questionId] || ''}
                    onChange={(e) => handleValueChange(questionId, e.target.value)}
                />;
            case 'multiple-choice':
                return (
                    <RadioGroup
                        required={question.required}
                        value={answers[questionId]}
                        onValueChange={(value) => handleValueChange(questionId, value)}
                    >
                        {question.options?.map(option => (
                            <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`${questionId}-${option}`} />
                                <Label htmlFor={`${questionId}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            case 'checkboxes':
                return (
                    <div>
                        {question.options?.map(option => (
                            <div key={option} className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                    id={`${questionId}-${option}`}
                                    checked={(answers[questionId] || []).includes(option)}
                                    onCheckedChange={(checked) => {
                                        const currentAnswers = answers[questionId] || [];
                                        const newAnswers = checked
                                            ? [...currentAnswers, option]
                                            : currentAnswers.filter((a: string) => a !== option);
                                        handleValueChange(questionId, newAnswers);
                                    }}
                                />
                                <Label htmlFor={`${questionId}-${option}`}>{option}</Label>
                            </div>
                        ))}
                    </div>
                );
            case 'rating':
                 return (
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant={answers[questionId] === value ? "default" : "outline"}
                          onClick={() => handleValueChange(questionId, value)}
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                );
            case 'file-upload':
                return <Input type="file" />;
            default:
                return null;
        }
    }


    return (
        <Card className="max-w-3xl mx-auto">
            {form.requiresSignIn && !isPreview && user && (
                <div className="p-4 border-b flex items-center justify-between text-sm bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span>Signed in as {user.email}</span>
                    </div>
                    <Button variant="link" className="p-0 h-auto" onClick={handleSwitchAccount}>Switch account</Button>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline">{form.title}</CardTitle>
                <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-8">
                    {form.questions.map((question, index) => (
                        <div key={question.id || index}>
                            <Label className="text-lg font-semibold">
                                {question.text}
                                {question.required && <span className="text-destructive ml-1">*</span>}
                            </Label>
                            <div className="mt-2">
                                {renderQuestion(question)}
                            </div>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting || isPreview}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isPreview ? 'Preview Mode' : 'Submit'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

    