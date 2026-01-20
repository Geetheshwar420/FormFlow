'use client';

import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/firebase/auth/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FormFlowLogo } from '@/components/icons';
import Link from 'next/link';

export default function SignupPage() {
  const { user, isUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return null;
  }
  
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
       <div className="hidden lg:flex flex-col items-start justify-center bg-muted p-12 relative">
         <Link href="/" className="flex items-center gap-3 mb-8 absolute top-12 left-12">
            <FormFlowLogo className="w-8 h-8 text-primary" />
            <span className="font-headline text-2xl font-semibold">
                FormFlow
            </span>
        </Link>
        <div className="max-w-md">
            <h1 className="text-4xl font-bold font-headline mb-4">Create your account</h1>
            <p className="text-muted-foreground text-lg">
                Join FormFlow to build beautiful forms and surveys in seconds. Analyze responses in real-time and make data-driven decisions.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                <FormFlowLogo className="w-8 h-8 text-primary" />
                <span className="font-headline text-2xl font-semibold">
                    FormFlow
                </span>
            </div>
            <AuthForm type="signup" />
        </div>
      </div>
    </div>
  );
}
