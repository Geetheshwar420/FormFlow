'use client'

import * as React from 'react';
import {
  useEffect,
  useState,
} from 'react';
import Image from 'next/image';
import { useAuth } from '@/firebase/auth/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, getDocs } from 'firebase/firestore';


// Internal Input component from the provided code
interface InputProps {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  [key: string]: any;
}

const AppInput = (props: InputProps) => {
  const { label, placeholder, icon, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full min-w-[200px] relative">
      {label &&
        <label className='block mb-2 text-sm'>
          {label}
        </label>
      }
      <div className="relative w-full">
        <input
          className="peer relative z-10 border-2 border-[var(--color-border)] h-13 w-full rounded-md bg-[var(--color-surface)] px-4 py-3 font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-[var(--color-bg)] placeholder:font-medium"
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, var(--color-text-primary) 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, var(--color-text-primary) 0%, transparent 70%)`,
              }}
            />
          </>
        )}
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// The main login page component content
function LoginContent() {
  const { user, isUserLoading, signIn, isAuthLoading, signInWithGoogle, sendPasswordReset } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (user && !isUserLoading) {
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/dashboard');
    }
  }, [user, isUserLoading, router, searchParams]);


  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let emailToSignIn = loginIdentifier;

    if (!loginIdentifier.includes('@')) {
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("username", "==", loginIdentifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast({
            title: 'Authentication Error',
            description: 'User not found.',
            variant: 'destructive'
          });
          return;
        }
        const userDoc = querySnapshot.docs[0];
        emailToSignIn = userDoc.data().email;

      } catch (err) {
        toast({
          title: 'Error',
          description: 'Could not verify username.',
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      await signIn(emailToSignIn, password);
      toast({
        title: 'Signed in.',
        description: "Welcome back! You're logged in.",
      });
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/dashboard');
    } catch (err: any) {
      toast({
        title: 'Authentication Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: 'Signed in with Google.',
        description: "Welcome! You're logged in.",
      });
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/dashboard');
    } catch (err: any) {
      toast({
        title: 'Authentication Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    try {
      await sendPasswordReset(resetEmail);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for a password reset link." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  const loginImage = PlaceHolderImages.find(p => p.id === 'login-image-1');

  const socialIcons = [
    {
      name: 'Google',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" /><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" /><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.612-3.512-11.283-8.192l-6.522 5.025C9.505 39.556 16.227 44 24 44z" /><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.712 34.755 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z" /></svg>,
      onClick: handleGoogleSignIn,
      gradient: 'bg-[var(--color-bg)]',
    }
  ];

  if (isUserLoading || user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <Dialog>
      <div className="h-screen w-full bg-[var(--color-bg)] flex items-center justify-center p-4 text-[var(--color-text-primary)]">
        <div className='w-full max-w-4xl flex justify-between h-[600px] bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden'>
          <div
            className='w-full lg:w-1/2 p-8 flex flex-col justify-center h-full relative overflow-hidden'
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-300/30 via-blue-300/30 to-pink-300/30 rounded-full blur-3xl transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'
                }`}
              style={{
                transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
            <div className="relative z-10">
              <form className='text-center grid gap-4 h-full' onSubmit={handleSubmit}>
                <div className='grid gap-4 mb-2'>
                  <h1 className='text-3xl md:text-4xl font-extrabold text-[var(--color-heading)]'>Sign in</h1>
                </div>

                <div className='grid gap-4 items-center'>
                  <AppInput placeholder="Email or Username" type="text" value={loginIdentifier} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginIdentifier(e.target.value)} />
                  <AppInput placeholder="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                </div>

                <DialogTrigger asChild>
                  <button type="button" className='font-light text-sm md:text-md text-[var(--color-text-secondary)] hover:underline'>Forgot your password?</button>
                </DialogTrigger>

                <div className='flex gap-4 justify-center items-center mt-4'>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md bg-[var(--color-border)] px-8 py-3 font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="text-sm px-2 py-1">Sign In</span>}
                    <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                      <div className="relative h-full w-8 bg-white/20" />
                    </div>
                  </button>
                </div>
                <div className="flex items-center my-2">
                  <div className="flex-grow border-t border-[var(--color-border)]"></div>
                  <span className="flex-shrink mx-4 text-sm text-[var(--color-text-secondary)]">or</span>
                  <div className="flex-grow border-t border-[var(--color-border)]"></div>
                </div>
                <div className="social-container mt-2">
                  <div className="flex items-center justify-center">
                    <ul className="flex gap-3 md:gap-4">
                      {socialIcons.map((social, index) => (
                        <li key={index} className="list-none">
                          <button
                            type="button"
                            onClick={social.onClick}
                            className="w-[2.5rem] h-[2.5rem] bg-[var(--color-bg-2)] rounded-full flex justify-center items-center relative z-[1] border-2 border-[var(--color-border)] overflow-hidden group"
                          >
                            <div
                              className={`absolute inset-0 w-full h-full ${social.gradient || 'bg-[var(--color-bg)]'} scale-y-0 origin-bottom transition-transform duration-500 ease-in-out group-hover:scale-y-100`}
                            />
                            <span className="text-[1.5rem] text-[var(--color-text-secondary)] transition-all duration-500 ease-in-out z-[2] group-hover:text-[var(--color-text-primary)]">
                              {social.icon}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="underline text-[var(--color-text-primary)]">
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className='hidden lg:block w-1/2 right h-full overflow-hidden relative'>
            {loginImage && <Image
              src={loginImage.imageUrl}
              loader={({ src }) => src}
              fill
              priority
              alt={loginImage.description}
              data-ai-hint={loginImage.imageHint}
              className="w-full h-full object-cover transition-transform duration-300 opacity-30"
            />}
          </div>
        </div>
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we will send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email-reset" className="text-right">
              Email
            </Label>
            <Input
              id="email-reset"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="col-span-3"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handlePasswordReset} disabled={isAuthLoading}>
            {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// The main page component wraps the content in Suspense
export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[var(--color-bg)]">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    }>
      <LoginContent />
    </React.Suspense>
  );
}
