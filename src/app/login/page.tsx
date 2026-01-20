'use client';

import { AuthForm } from '@/components/auth-form';
import { useAuth } from '@/firebase/auth/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, isUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <AuthForm type="login" />
    </div>
  );
}
