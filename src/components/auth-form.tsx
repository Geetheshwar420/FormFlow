'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase/auth/use-auth';
import Link from 'next/link';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type AuthFormProps = {
  type: 'login' | 'signup';
};

export function AuthForm({ type }: AuthFormProps) {
  const { signUp, signIn, isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    try {
      if (type === 'signup') {
        await signUp(values.email, values.password);
      } else {
        await signIn(values.email, values.password);
      }
      toast({
        title: type === 'signup' ? 'Account created.' : 'Signed in.',
        description:
          type === 'signup'
            ? 'Welcome! You have been signed up successfully.'
            : "Welcome back! You're logged in.",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Authentication Error',
        description: err.message,
        variant: 'destructive'
      })
    }
  }

  return (
    <>
        <div className="text-left mb-8">
            <h1 className="text-3xl font-bold font-headline">
            {type === 'login' ? 'Sign In to your Account' : 'Create an Account'}
            </h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="m@example.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isAuthLoading}>
              {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === 'login' ? <>Sign In <ArrowRight /></> : 'Sign Up'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {type === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </>
          )}
        </div>
    </>
  );
}
