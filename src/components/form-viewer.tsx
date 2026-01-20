
'use client';

import { useState } from "react";
import { Form, Question } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { Loader2 } from "lucide-react";

interface FormViewerProps {
    form: Omit<Form, 'id' | 'userId' | 'responseCount' | 'createdAt' | 'updatedAt'> & { id: string };
    isPreview?: boolean;
}

export function FormViewer({ form, isPreview = false }: FormViewerProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleValueChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isPreview) return;

        setIsSubmitting(true);
        try {
            const responsesCollection = collection(firestore, `forms/${form.id}/responses`);
            const responsePayload = {
                formId: form.id,
                submittedAt: new Date().toISOString(),
                answers: Object.entries(answers).map(([questionId, value]) => ({
                    questionId,
                    value,
                }))
            };
            await addDocumentNonBlocking(responsesCollection, responsePayload);
            toast({
                title: "Response submitted!",
                description: "Thank you for filling out the form.",
            });
            setAnswers({});
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
