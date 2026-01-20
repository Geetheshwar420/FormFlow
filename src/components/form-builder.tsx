"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Form, Question, QuestionType, FormResponse } from "@/lib/types";
import {
  PlusCircle,
  Trash2,
  Copy,
  ArrowLeft,
  Share,
  Pencil,
  Eye,
  BarChart3,
  Settings,
  Users,
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase/auth/use-auth";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, doc, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import { FormViewer } from "./form-viewer";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Image from "next/image";

const questionTypes: {
  value: QuestionType;
  label: string;
}[] = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Paragraph" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "rating", label: "Rating" },
  { value: "file-upload", label: "File Upload" },
];

interface FormBuilderProps {
  initialData?: Omit<Form, 'id'> & { id: string };
}

type CollaboratorProfile = { id: string; email?: string; displayName?: string, photoURL?: string };

export function FormBuilder({ initialData }: FormBuilderProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const firestore = useFirestore();

  const [title, setTitle] = useState(initialData?.title || "Untitled Form");
  const [description, setDescription] = useState(initialData?.description || "");
  const [questions, setQuestions] = useState<Question[]>(() =>
    initialData?.questions.map((q) => ({ ...q, id: q.id || crypto.randomUUID() })) || []
  );
  const [requiresSignIn, setRequiresSignIn] = useState(initialData?.requiresSignIn || false);

  const [newCollabEmail, setNewCollabEmail] = useState("");
  const [collaboratorProfiles, setCollaboratorProfiles] = useState<CollaboratorProfile[]>([]);
  const [isCollaboratorsLoading, setIsCollaboratorsLoading] = useState(false);
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false);

  useEffect(() => {
    if (initialData?.editors && initialData.editors.length > 0) {
      setIsCollaboratorsLoading(true);
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('id', 'in', initialData.editors));
      getDocs(q).then(snapshot => {
        const profiles = snapshot.docs.map(doc => doc.data() as CollaboratorProfile);
        setCollaboratorProfiles(profiles);
      }).finally(() => setIsCollaboratorsLoading(false));
    } else {
        setCollaboratorProfiles([]);
    }
  }, [initialData?.editors, firestore]);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      text: "Untitled Question",
      required: false,
      ...((type === "multiple-choice" || type === "checkboxes") && { options: ["Option 1"] })
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const duplicateQuestion = (id: string) => {
    const questionToDuplicate = questions.find(q => q.id === id);
    if (questionToDuplicate) {
      const newQuestion = { ...questionToDuplicate, id: crypto.randomUUID() };
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
    
    // Only the owner or an editor can save
    const isOwner = initialData?.userId === user.uid;
    const isEditor = initialData?.editors?.includes(user.uid);
    if(initialData && !isOwner && !isEditor) {
        toast({ title: "Unauthorized", description: "You don't have permission to save this form.", variant: "destructive" });
        return;
    }

    const formPayload = {
      title,
      description,
      questions,
      requiresSignIn,
    };

    try {
      if (initialData?.id) {
        const formRef = doc(firestore, 'users', initialData.userId, 'forms', initialData.id);
        const formToUpdate = {
          ...formPayload,
          updatedAt: new Date().toISOString(),
        };
        setDocumentNonBlocking(formRef, formToUpdate, { merge: true });
        toast({
          title: "Form updated!",
          description: "Your form has been successfully updated.",
        });
        // Don't redirect if editor, only if owner just created it
        if(isOwner) {
            router.push('/dashboard');
        }
      } else {
        const formsCollection = collection(firestore, 'users', user.uid, 'forms');
        const formToSave = {
          ...formPayload,
          userId: user.uid,
          responseCount: 0,
          editors: [],
          createdAt: new Date().toISOString(),
        };
        addDocumentNonBlocking(formsCollection, formToSave).then(newFormRef => {
          if (newFormRef) {
            // Create the public lookup document
            const lookupRef = doc(firestore, 'form_lookups', newFormRef.id);
            setDocumentNonBlocking(lookupRef, { ownerId: user.uid }, {});
            
            toast({
              title: "Form saved!",
              description: "Your form has been successfully saved.",
            });
            router.replace(`/forms/edit/${newFormRef.id}`);
          }
        });
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "There was an error saving your form.",
        variant: "destructive",
      });
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollabEmail || !user || !initialData || user.uid !== initialData.userId) return;

    if (newCollabEmail === user.email) {
        toast({ title: "You are the owner of this form.", variant: "destructive" });
        return;
    }

    setIsSubmittingCollab(true);
    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', newCollabEmail));
        const userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
            toast({ title: "User not found", description: `No user with email ${newCollabEmail} found.`, variant: "destructive" });
            return;
        }

        const collaborator = userSnapshot.docs[0].data();
        if (initialData.editors?.includes(collaborator.id)) {
            toast({ title: "Collaborator already exists", description: `${newCollabEmail} is already a collaborator.` });
            return;
        }

        const formRef = doc(firestore, 'users', user.uid, 'forms', initialData.id);
        await updateDoc(formRef, {
            editors: arrayUnion(collaborator.id)
        });
        
        toast({ title: "Collaborator Added", description: `${collaborator.displayName || collaborator.email} can now edit this form.` });
        setNewCollabEmail("");

    } catch (error) {
        console.error("Error adding collaborator:", error);
        toast({ title: "Error", description: "Could not add collaborator.", variant: "destructive" });
    } finally {
        setIsSubmittingCollab(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!user || !initialData || user.uid !== initialData.userId) return;
    try {
        const formRef = doc(firestore, 'users', user.uid, 'forms', initialData.id);
        await updateDoc(formRef, {
            editors: arrayRemove(collaboratorId)
        });
        toast({ title: "Collaborator Removed", description: "Access has been revoked." });
    } catch(error) {
        console.error("Error removing collaborator:", error);
        toast({ title: "Error", description: "Could not remove collaborator.", variant: "destructive" });
    }
  };


  const responsesRef = useMemoFirebase(() => {
    if (!initialData?.id || !user) return null;
    const formOwnerId = initialData.userId;
    return collection(firestore, `users/${formOwnerId}/forms/${initialData.id}/responses`);
  }, [firestore, initialData, user]);

  const { data: responses, isLoading: areResponsesLoading } = useCollection<Omit<FormResponse, 'id'>>(responsesRef);

  const isOwner = initialData?.userId === user?.uid;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-headline">{initialData ? 'Edit Form' : 'Create Form'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={saveForm}>
            <Share className="mr-2 h-4 w-4" /> {initialData ? 'Save Changes' : 'Save Form'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList>
          <TabsTrigger value="builder"><Pencil className="mr-2 h-4 w-4" />Builder</TabsTrigger>
          <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4" />Preview</TabsTrigger>
          <TabsTrigger value="responses" disabled={!initialData?.id}>
            <BarChart3 className="mr-2 h-4 w-4" />Responses
          </TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
          {isOwner && initialData && (
             <TabsTrigger value="collaborators"><Users className="mr-2 h-4 w-4" />Collaborators</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="builder" className="mt-6">
          <div className="flex flex-col gap-6">
            <Card className="border-t-4 border-t-primary">
              <CardContent className="pt-6">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled Form"
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

            {questions.map((question) => (
              <Card key={question.id}>
                <CardContent className="pt-6">
                   <div className="flex justify-between items-start gap-4">
                      <Input
                          placeholder="Untitled Question"
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                          className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 flex-grow"
                      />
                      <Select onValueChange={(type: QuestionType) => updateQuestion(question.id, { type })} defaultValue={question.type}>
                          <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Question type" />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map(qt => (
                                <SelectItem key={qt.value} value={qt.value}>{qt.label}</SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="mt-4">
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
                  </div>
                  <Separator className="my-4" />
                   <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Duplicate" onClick={() => duplicateQuestion(question.id)}><Copy className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => removeQuestion(question.id)}><Trash2 className="w-4 h-4" /></Button>
                      <Separator orientation="vertical" className="h-6 mx-2" />
                      <div className="flex items-center space-x-2">
                          <Label htmlFor={`required-${question.id}`}>Required</Label>
                          <Switch
                              id={`required-${question.id}`}
                              checked={question.required}
                              onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                          />
                      </div>
                  </div>
                </CardContent>
              </Card>
            ))}
             <Button variant="outline" className="w-full py-8 border-dashed" onClick={() => addQuestion('text')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="preview" className="mt-6">
            <FormViewer form={{id: initialData?.id || 'preview', userId: user?.uid || '', title, description, questions, responseCount: 0, createdAt: '', requiresSignIn}} isPreview />
        </TabsContent>
        <TabsContent value="responses" className="mt-6">
             <Card>
                <CardHeader>
                  <CardTitle>Responses</CardTitle>
                  <CardDescription>A list of all submissions for this form.</CardDescription>
                </CardHeader>
                <CardContent>
                  {areResponsesLoading ? (
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
                  ) : (
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
                  )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
              <CardDescription>Adjust how your form collects responses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="require-signin" className="text-base">Require Sign-In</Label>
                  <p className="text-sm text-muted-foreground">
                    Respondents will be required to sign in to a FormFlow account to respond.
                  </p>
                </div>
                <Switch
                  id="require-signin"
                  checked={requiresSignIn}
                  onCheckedChange={setRequiresSignIn}
                  disabled={!isOwner}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {isOwner && initialData && (
            <TabsContent value="collaborators" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Collaborators</CardTitle>
                        <CardDescription>Invite others to edit this form with you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex gap-2">
                             <Input 
                                placeholder="Collaborator's email"
                                value={newCollabEmail}
                                onChange={(e) => setNewCollabEmail(e.target.value)}
                             />
                             <Button onClick={handleAddCollaborator} disabled={isSubmittingCollab}>
                                {isSubmittingCollab && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Add
                            </Button>
                         </div>

                         <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Current Collaborators</h3>
                            {isCollaboratorsLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : collaboratorProfiles.length > 0 ? (
                                collaboratorProfiles.map(collab => (
                                <div key={collab.id} className="flex items-center justify-between p-2 rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            {collab.photoURL && <Image src={collab.photoURL} alt={collab.displayName || 'avatar'} width={32} height={32} />}
                                            <AvatarFallback>{collab.email?.[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{collab.displayName}</p>
                                            <p className="text-sm text-muted-foreground">{collab.email}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleRemoveCollaborator(collab.id)}>Remove</Button>
                                </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No collaborators yet.</p>
                            )}
                         </div>
                    </CardContent>
                </Card>
            </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
