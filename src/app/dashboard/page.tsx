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
import { BarChart, Edit, Share2, PlusCircle, FileText } from "lucide-react";
import { useAuth } from "@/firebase/auth/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import type { Form } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function Dashboard() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const formsCollection = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/forms`) : null, [firestore, user]);
  const { data: forms, isLoading } = useCollection<Omit<Form, 'id'>>(formsCollection);

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
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your forms and view responses.
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
                  <CardTitle className="font-headline text-xl truncate">
                    {form.title}
                  </CardTitle>
                  <CardDescription className="truncate">
                    {form.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Responses</span>
                    <Badge variant="secondary">{form.responseCount || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                    <span>Created</span>
                    <span className="font-mono text-xs">{new Date(form.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col sm:flex-row gap-2">
                  <Link href={`/forms/edit/${form.id}`} passHref>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Edit />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/analytics/${form.id}`} passHref>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <BarChart />
                      Analytics
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto ml-auto">
                    <Share2 />
                    Share
                  </Button>
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
    </AuthGuard>
  );
}

export default Dashboard;
