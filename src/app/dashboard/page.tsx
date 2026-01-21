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
import { BarChart3, Edit, Trash2, PlusCircle, FileText, Calendar, Share2, Eye, Copy, Share, QrCode, Download } from "lucide-react";
import { useAuth } from "@/firebase/auth/use-auth";
import { AuthGuard } from "@/components/auth-guard";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { collectionGroup, query, where, doc, collection } from "firebase/firestore";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect } from "react";
import QRCode from "react-qr-code";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { firebaseConfig } from "@/firebase/config";


function Dashboard() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFormForShare, setSelectedFormForShare] = useState<(Omit<Form, 'id'> & { id: string; }) | null>(null);

  // Query 1: Forms owned by the current user
  const ownedFormsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'forms');
  }, [firestore, user]);

  const { data: ownedFormsData, isLoading: isOwnedLoading, error: ownedError } = useCollection<Omit<Form, 'id'>>(ownedFormsRef);

  // Query 2: Forms shared with the current user (they are editors)
  const sharedFormsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collectionGroup(firestore, 'forms'),
      where('editors', 'array-contains', user.uid)
    );
  }, [firestore, user]);

  const { data: sharedFormsData, isLoading: isSharedLoading, error: sharedError } = useCollection<Omit<Form, 'id'>>(sharedFormsQuery);

  // Debug logging to identify the source of permission error
  useEffect(() => {
    if (user) {
      console.log('Dashboard: Current User UID:', user.uid);
    }
    if (ownedError) {
      console.error('Dashboard: Owned forms query error:', ownedError);
    }
    if (sharedError) {
      console.error('Dashboard: Shared forms query error:', sharedError);
    }
    if (ownedFormsData) {
      console.log('Dashboard: Owned forms loaded:', ownedFormsData.length);
    }
    if (sharedFormsData) {
      console.log('Dashboard: Shared forms loaded:', sharedFormsData.length);
    }
  }, [user, ownedError, sharedError, ownedFormsData, sharedFormsData]);

  const isLoading = isOwnedLoading || isSharedLoading;

  const formsData = useMemo(() => {
    if (!ownedFormsData && !sharedFormsData) return null;
    // Combine owned and shared forms, removing duplicates
    const allForms = [...(ownedFormsData || []), ...(sharedFormsData || [])];
    const uniqueForms = Array.from(
      new Map(allForms.map(form => [form.id, form])).values()
    );
    return uniqueForms;
  }, [ownedFormsData, sharedFormsData]);

  const forms = useMemo(() => {
    if (!formsData) return [];
    // Sort the combined results by creation date.
    return formsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [formsData]);


  const publicOrigin = `https://${firebaseConfig.projectId}.web.app`;
  const formUrl = selectedFormForShare ? `${publicOrigin}/v/${selectedFormForShare.id}` : '';

  const copyToClipboard = () => {
    if (!formUrl) return;
    navigator.clipboard.writeText(formUrl);
    toast({
      title: "Link Copied!",
      description: "The form link has been copied to your clipboard.",
    });
  };

  const shareOnTelegram = () => {
    if (!formUrl || !selectedFormForShare) return;
    const text = `Check out this form: ${selectedFormForShare.title}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  };

  const shareOnWhatsApp = () => {
    if (!formUrl) return;
    const text = `Check out this form: ${formUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareGeneric = async () => {
    if (navigator.share && selectedFormForShare) {
      try {
        await navigator.share({
          title: selectedFormForShare.title,
          text: selectedFormForShare.description || 'Check out this form!',
          url: formUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
      toast({
        title: "Sharing not supported",
        description: 'Link copied to clipboard instead.',
      });
    }
  };

  const handleDelete = () => {
    if (formToDelete && user) {
      // To delete, we need the owner's ID, which might not be the current user
      const form = forms.find(f => f.id === formToDelete);
      if (form && form.userId === user.uid) { // Double check ownership before deleting
        const formRef = doc(firestore, 'users', user.uid, 'forms', formToDelete);
        const lookupRef = doc(firestore, 'form_lookups', formToDelete);

        deleteDocumentNonBlocking(formRef);
        deleteDocumentNonBlocking(lookupRef);

        toast({
          title: "Form Deleted",
          description: "The form has been successfully deleted.",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: "You do not have permission to delete this form.",
          variant: "destructive"
        });
      }
      setFormToDelete(null);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("form-qrcode");
    if (svg && selectedFormForShare) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const padding = 32; // 16px on each side
      canvas.width = svg.clientWidth + padding;
      canvas.height = svg.clientHeight + padding;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill background with white
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.onload = () => {
        // Draw image with padding
        ctx.drawImage(img, padding / 2, padding / 2);

        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${selectedFormForShare.title.replace(/ /g, "_")}-qrcode.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
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

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share "{selectedFormForShare?.title}"</DialogTitle>
              <DialogDescription>
                Anyone can access your form via the link or QR code.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="link" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link"><Share2 className="mr-2 h-4 w-4" /> Share Link</TabsTrigger>
                <TabsTrigger value="qr"><QrCode className="mr-2 h-4 w-4" /> QR Code</TabsTrigger>
              </TabsList>
              <TabsContent value="link">
                <div className="flex flex-col space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button variant="outline" onClick={shareOnWhatsApp}>
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 fill-current"><title>WhatsApp</title><path d="M12.04 2.016c-5.524 0-9.998 4.476-9.998 9.998 0 1.77.463 3.44.29 5.04l-1.523 4.422 4.52-1.505c1.55.823 3.31 1.278 5.17 1.278h.005c5.523 0 9.997-4.476 9.997-9.998s-4.474-9.998-9.998-9.998zm0 18.357c-1.63 0-3.18-.48-4.52-1.353l-.32-.19-3.35 1.113 1.128-3.28-.21-.33c-.92-1.42-1.41-3.07-1.41-4.79 0-4.63 3.76-8.39 8.39-8.39 4.63 0 8.39 3.76 8.39 8.39s-3.76 8.39-8.39 8.39zm4.52-6.148c-.246-.123-1.45-.715-1.675-.795-.225-.08-.39-.123-.555.123-.165.246-.633.795-.778.96-.145.165-.29.185-.535.06-.246-.123-1.04-.383-1.98-1.22-.73-.65-1.22-1.45-1.36-1.7-.145-.246-.015-.38.11-.505.11-.11.246-.29.37-.435.123-.145.165-.246.246-.41.08-.165.04-.308-.02-.43-.06-.123-.555-1.345-.76-1.84-.2-.48-.41-.41-.555-.42-.14-.01-.305-.01-.47-.01-.165 0-.435.06-.66.308-.225.246-.86.84-1.05 2.06-.2 1.22.88 2.39 1.005 2.555.123.165 1.75 2.66 4.24 3.74.58.25 1.04.405 1.4.52.59.18 1.13.16 1.56.1.48-.07 1.45-.59 1.65-1.15.2-.56.2-.92.14-1.04-.06-.12-.22-.2-.46-.32z" /></svg>
                      WhatsApp
                    </Button>
                    <Button variant="outline" onClick={shareOnTelegram}>
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 fill-current"><title>Telegram</title><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.28 1.28.2 1.02.94l-2.7 12.04c-.2.83-.8.98-1.5.6l-4.9-3.6-2.4 2.3c-.26.26-.48.47-.85.47z" /></svg>
                      Telegram
                    </Button>
                    <Button variant="outline" onClick={shareGeneric}>
                      <Share className="mr-2 h-4 w-4" />
                      More...
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Label htmlFor="link" className="sr-only">Link</Label>
                    <Input value={formUrl} readOnly id="link" />
                    <Button onClick={copyToClipboard} size="icon">
                      <span className="sr-only">Copy</span>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="qr">
                <div className="flex flex-col items-center justify-center gap-4 py-4">
                  <div className="p-4 bg-white rounded-lg">
                    <QRCode
                      id="form-qrcode"
                      value={formUrl}
                      size={200}
                      bgColor={"#FFFFFF"}
                      fgColor={"#000000"}
                      level={"L"}
                    />
                  </div>
                  <Button onClick={downloadQRCode} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

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
                      <div className="flex gap-2">
                        {form.userId !== user?.uid && <Badge variant="secondary">Shared</Badge>}
                        <Badge variant="outline">Draft</Badge>
                      </div>
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
                    {form.userId === user?.uid && (
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="Delete" onClick={() => setFormToDelete(form.id)}>
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                    )}
                    <Button variant="ghost" size="icon" title="Share" onClick={() => {
                      setSelectedFormForShare(form);
                      setShareDialogOpen(true);
                    }}>
                      <Share2 />
                    </Button>
                    <Link href={`/v/${form.id}`} passHref className="ml-auto">
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

