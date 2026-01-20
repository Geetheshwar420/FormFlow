'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Billing
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and payment details.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the Free Plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg">Free Plan</h3>
                <p className="text-muted-foreground mt-2">Includes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Up to 3 forms</li>
                    <li>100 responses per month</li>
                    <li>Basic analytics</li>
                    <li>Community support</li>
                </ul>
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Upgrade Plan</CardTitle>
            <CardDescription>Unlock more features by upgrading to our Pro Plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 border rounded-lg">
                <h3 className="font-semibold text-lg">Pro Plan - $20/month</h3>
                <p className="text-muted-foreground mt-2">Includes everything in Free, plus:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Unlimited forms</li>
                    <li>Unlimited responses</li>
                    <li>Advanced analytics</li>
                    <li>Priority support</li>
                </ul>
                 <Button className="mt-6">Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
