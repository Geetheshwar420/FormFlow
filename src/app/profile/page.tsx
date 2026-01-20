'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/firebase/auth/use-auth";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile information.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="User Avatar"
                    width={80}
                    height={80}
                    data-ai-hint="person face"
                  />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button variant="outline">Change Photo</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Your username" defaultValue={user?.displayName || ''} />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
