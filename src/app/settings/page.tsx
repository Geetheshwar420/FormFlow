'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
              Settings
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          This page has been removed as requested.
        </p>
      </div>
    </AuthGuard>
  );
}
