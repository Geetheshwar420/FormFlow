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
import { mockForms } from "@/lib/data";
import { BarChart, Edit, Share2, PlusCircle, Eye } from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
  const forms = mockForms;

  return (
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

      {forms.length > 0 ? (
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
                  <Badge variant="secondary">{form.responseCount}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                  <span>Created</span>
                  <span className="font-mono text-xs">{form.createdAt}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Edit />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <BarChart />
                  Analytics
                </Button>
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
            <div
                className="w-48 h-48 mb-4 relative"
            >
                <Image
                    src="https://picsum.photos/seed/102/400/300"
                    alt="No forms created yet"
                    fill
                    className="object-cover rounded-lg"
                    data-ai-hint="abstract geometric"
                />
            </div>
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
  );
}
