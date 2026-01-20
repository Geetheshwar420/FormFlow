'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BarChart3, Edit, Trash2, PlusCircle, FileText, Calendar, Share2, Eye } from "lucide-react";
import { useAuth } from "@/firebase/auth/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection, query, where, doc } from "firebase/firestore";
import type { Form } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react";


function Dashboard() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const formsCollection = useMemoFirebase(() => user ? query(collection(firestore, 'forms'), where('userId', '==', user.uid)) : null, [firestore, user]);
  const { data: forms, isLoading } = useCollection<Omit<Form, 'id'>>(formsCollection);

  const handleShare = (formId: string) => {
    const url = `${window.location.origin}/view/${formId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "The form link has been copied to your clipboard.",
    });
  };
  
  const handleDelete = () => {
    if (formToDelete) {
      const formRef = doc(firestore, 'forms', formToDelete);
      deleteDocumentNonBlocking(formRef);
      toast({
        title: "Form Deleted",
        description: "The form has been successfully deleted.",
      });
      setFormToDelete(null);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20 ml-auto" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
       <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              form and all of its responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFormToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Your Forms
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your surveys and analyze responses.
            </p>
          </div>
          <Link href="/forms/create">
            <Button>
              <PlusCircle />
              Create New Form
            </Button>
          </Link>
        </div>

        {forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card
                key={form.id}
                className="flex flex-col hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="font-headline text-xl truncate">
                      {form.title}
                    </CardTitle>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <CardDescription className="truncate h-4">
                    {form.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{form.questions.length} Questions</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center gap-2 bg-muted/50 p-3">
                  <Link href={`/forms/edit/${form.id}`} passHref>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit />
                    </Button>
                  </Link>
                  <Link href={`/analytics/${form.id}`} passHref>
                    <Button variant="ghost" size="icon" title="Analytics">
                      <BarChart3 />
                    </Button>
                  </Link>
                   <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => setFormToDelete(form.id)}>
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                  <Button variant="ghost" size="icon" title="Share" onClick={() => handleShare(form.id)}>
                    <Share2 />
                  </Button>
                  <Link href={`/view/${form.id}`} passHref className="ml-auto">
                    <Button>
                      <Eye />
                      View
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 mt-8">
            <FileText className="w-16 h-16 mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-headline font-semibold">
              No Forms Yet
            </h2>
            <p className="text-muted-foreground mt-2 mb-4 max-w-sm">
              You haven&apos;t created any forms. Get started by creating your
              first form.
            </p>
            <Link href="/forms/create">
              <Button size="lg">
                <PlusCircle />
                Create Your First Form
              </Button>
            </Link>
          </div>
        )}
      </div>
      </AlertDialog>
    </AuthGuard>
  );
}

export default Dashboard;
