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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/firebase/auth/use-auth';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          {type === 'login' ? 'Login' : 'Sign Up'}
        </CardTitle>
        <CardDescription>
          {type === 'login'
            ? 'Enter your email below to login to your account.'
            : 'Enter your email and password to create an account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
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
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isAuthLoading}>
              {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === 'login' ? 'Login' : 'Sign Up'}
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
      </CardContent>
    </Card>
  );
}
