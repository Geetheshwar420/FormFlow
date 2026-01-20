'use client';

import { useAuth } from '@/firebase/auth/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    // You can return a loading spinner here
    return null;
  }

  return <>{children}</>;
}
