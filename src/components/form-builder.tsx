"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Form, Question, QuestionType } from "@/lib/types";
import {
  PlusCircle,
  Trash2,
  Type,
  List,
  Star,
  Upload,
  FileText,
  BadgeCheck,
  Copy,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase/auth/use-auth";
import { useFirestore } from "@/firebase/provider";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";


const questionTypes: {
  value: QuestionType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "text", label: "Text", icon: Type },
  { value: "textarea", label: "Paragraph", icon: FileText },
  { value: "multiple-choice", label: "Multiple Choice", icon: List },
  { value: "checkboxes", label: "Checkboxes", icon: BadgeCheck },
  { value: "rating", label: "Rating", icon: Star },
  { value: "file-upload", label: "File Upload", icon: Upload },
];

interface FormBuilderProps {
  initialData?: Omit<Form, 'id'> & { id: string };
}

export function FormBuilder({ initialData }: FormBuilderProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const firestore = useFirestore();

  const [title, setTitle] = useState(initialData?.title || "Untitled Form");
  const [description, setDescription] = useState(initialData?.description || "");
  const [questions, setQuestions] = useState<Question[]>(() => 
    initialData?.questions.map((q, i) => ({...q, id: `q_${i}_${Date.now()}`})) || []
  );
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type,
      text: "Untitled Question",
      required: false,
      ...( (type === "multiple-choice" || type === "checkboxes") && { options: ["Option 1"] } )
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (selectedQuestion === id) {
        setSelectedQuestion(null);
    }
  };
  
  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
        const newQuestion = { ...questionToDuplicate, id: `q_${Date.now()}` };
        const index = questions.findIndex(q => q.id === id);
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, newQuestion);
        setQuestions(newQuestions);
    }
  };

  const saveForm = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save a form.",
        variant: "destructive"
      });
      return;
    }

    if (initialData?.id) {
      const formRef = doc(firestore, `users/${user.uid}/forms/${initialData.id}`);
      const formToUpdate = {
        title,
        description,
        questions: questions.map(({id, ...rest}) => rest),
        updatedAt: new Date().toISOString(),
      };
      setDocumentNonBlocking(formRef, formToUpdate, { merge: true });
      toast({
        title: "Form updated!",
        description: "Your form has been successfully updated.",
      });
      router.push('/');
    } else {
      try {
        const formsCollection = collection(firestore, `users/${user.uid}/forms`);
        const formToSave = {
          title,
          description,
          questions: questions.map(({id, ...rest}) => rest), // Remove client-side id before saving
          responseCount: 0,
          createdAt: new Date().toISOString(),
        };
        await addDocumentNonBlocking(formsCollection, formToSave);
        toast({
          title: "Form saved!",
          description: "Your form has been successfully saved.",
        });
        router.push('/');
      } catch (error) {
        console.error("Error saving form:", error);
        toast({
          title: "Error",
          description: "There was an error saving your form.",
          variant: "destructive",
        });
      }
    }
  }


  const QuestionEditor = ({ question }: { question: Question }) => (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor={`q-text-${question.id}`}>Question Text</Label>
            <Input
                id={`q-text-${question.id}`}
                value={question.text}
                onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
            />
        </div>
        {(question.type === "multiple-choice" || question.type === "checkboxes") && (
            <div className="space-y-2">
                <Label>Options</Label>
                {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            value={option}
                            onChange={(e) => {
                                const newOptions = [...(question.options || [])];
                                newOptions[index] = e.target.value;
                                updateQuestion(question.id, { options: newOptions });
                            }}
                        />
                        <Button variant="ghost" size="icon" onClick={() => {
                            const newOptions = question.options?.filter((_, i) => i !== index);
                            updateQuestion(question.id, { options: newOptions });
                        }}><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => {
                    const newOptions = [...(question.options || []), `Option ${ (question.options?.length || 0) + 1}`];
                    updateQuestion(question.id, { options: newOptions });
                }}><PlusCircle className="mr-2 h-4 w-4" /> Add Option</Button>
            </div>
        )}
        <Separator />
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => duplicateQuestion(question.id)}><Copy className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => removeQuestion(question.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center space-x-2">
                <Label htmlFor={`required-${question.id}`}>Required</Label>
                <Switch
                    id={`required-${question.id}`}
                    checked={question.required}
                    onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                />
            </div>
        </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-headline font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Form description"
              className="mt-2 border-none shadow-none focus-visible:ring-0 px-0"
            />
          </CardContent>
        </Card>

        {questions.map((q) => (
          <Card key={q.id} onClick={() => setSelectedQuestion(q.id)} className={`cursor-pointer transition-all ${selectedQuestion === q.id ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'}`}>
            <CardContent className="pt-6">
                {selectedQuestion === q.id ? (
                    <QuestionEditor question={q} />
                ) : (
                    <div>
                        <p className="font-semibold">{q.text} {q.required && <span className="text-destructive">*</span>}</p>
                        { (q.type === 'text') && <Input disabled placeholder="Short answer text" className="mt-2" />}
                        { (q.type === 'textarea') && <Textarea disabled placeholder="Long answer text" className="mt-2" />}
                        { (q.type === 'multiple-choice' || q.type === 'checkboxes') && <div className="mt-2 space-y-2 text-muted-foreground">{q.options?.map((opt, i) => <p key={i}>- {opt}</p>)}</div>}
                        { (q.type === 'rating') && <p className="text-sm text-muted-foreground mt-2">Rating input placeholder</p>}
                        { (q.type === 'file-upload') && <p className="text-sm text-muted-foreground mt-2">File upload placeholder</p>}
                    </div>
                )}
            </CardContent>
          </Card>
        ))}
         <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
                 <p className="text-muted-foreground mb-4">Add a new question to your form</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {questionTypes.map((qt) => (
                    <Button
                    key={qt.value}
                    variant="outline"
                    onClick={() => addQuestion(qt.value)}
                    className="flex flex-col h-24 gap-2"
                    >
                    <qt.icon className="w-8 h-8 text-primary" />
                    <span>{qt.label}</span>
                    </Button>
                ))}
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky top-24">
        <Button size="lg" className="w-full" onClick={saveForm}>Save Form</Button>
      </div>
    </div>
  );
}
