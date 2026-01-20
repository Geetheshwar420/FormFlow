'use client';

import { AuthGuard } from "@/components/auth-guard";

export default function BillingPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Billing
        </h1>
        <p className="text-muted-foreground">
          This page has been removed as requested.
        </p>
      </div>
    </AuthGuard>
  );
}
