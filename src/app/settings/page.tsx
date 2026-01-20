'use client';

import { AuthGuard } from "@/components/auth-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and application settings.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="text-lg">Theme</Label>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
