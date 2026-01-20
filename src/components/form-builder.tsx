"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Question, QuestionType } from "@/lib/types";
import {
  PlusCircle,
  Trash2,
  Type,
  List,
  Star,
  Upload,
  FileText,
  BadgeCheck,
  Wand2,
  Loader2,
  Copy,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { suggestFormFields } from "@/ai/flows/ai-form-suggestion";

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

export function FormBuilder() {
  const { toast } = useToast();
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const [documentSnippet, setDocumentSnippet] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

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


  const handleSuggest = async () => {
    if (!documentSnippet.trim()) {
      toast({
        title: "Input required",
        description: "Please paste a document snippet to get suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const result = await suggestFormFields({ documentSnippet });
      setSuggestions(result.suggestedFields);
      if (result.suggestedFields.length === 0) {
        toast({ title: "No suggestions found." });
      }
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        title: "An error occurred",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const addSuggestionAsQuestion = (suggestion: string) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: 'text',
      text: suggestion,
      required: false,
    };
    setQuestions(prev => [...prev, newQuestion]);
    setSuggestions(prev => prev.filter(s => s !== suggestion));
    toast({
        title: "Question added!",
        description: `"${suggestion}" was added to your form.`,
      });
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
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 className="text-primary" /> AI Suggestions
            </CardTitle>
            <CardDescription>
              Paste a document snippet to get automatic field suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your document snippet here..."
              value={documentSnippet}
              onChange={(e) => setDocumentSnippet(e.target.value)}
              rows={6}
            />
            <Button onClick={handleSuggest} disabled={isSuggesting} className="w-full">
              {isSuggesting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Wand2 />
              )}
              Suggest Fields
            </Button>
            {suggestions.length > 0 && (
              <div className="space-y-2 pt-4">
                <h4 className="font-semibold">Suggested Fields:</h4>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                    <Button key={i} variant="secondary" size="sm" onClick={() => addSuggestionAsQuestion(s)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {s}
                    </Button>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Button size="lg" className="w-full">Save Form</Button>
      </div>
    </div>
  );
}
