'use client'

import * as React from 'react';
import {
  useEffect,
  useState,
  CSSProperties,
  useRef,
} from 'react';
import Image from 'next/image';
import { useAuth } from '@/firebase/auth/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import styles from './signup.module.css';

// Internal Input component
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
  const topGradientRef = useRef<HTMLDivElement>(null);
  const bottomGradientRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setMousePosition({
      x,
      y: e.clientY - rect.top
    });
    
    // Update CSS variables directly
    if (topGradientRef.current) {
      topGradientRef.current.style.setProperty('--mouse-x', `${x}px`);
    }
    if (bottomGradientRef.current) {
      bottomGradientRef.current.style.setProperty('--mouse-x', `${x}px`);
    }
  };

  return (
    <div className={styles.inputWrapper}>
      { label && 
        <label className={styles.inputLabel}>
          {label}
        </label>
      }
      <div className={styles.inputField}>
        <input
          className={styles.input}
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              ref={topGradientRef}
              className={styles.topGradient}
            />
            <div
              ref={bottomGradientRef}
              className={styles.bottomGradient}
            />
          </>
        )}
        {icon && (
          <div className={styles.inputIcon}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// The main page component
export default function SignupPage() {
  const { user, isUserLoading, signUp, signInWithGoogle, isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);


  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const gradientBlobRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - leftSection.left;
    const y = e.clientY - leftSection.top;
    setMousePosition({
      x,
      y
    });
    
    // Update CSS variables directly
    if (gradientBlobRef.current) {
      gradientBlobRef.current.style.setProperty('--blob-x', `${x - 250}px`);
      gradientBlobRef.current.style.setProperty('--blob-y', `${y - 250}px`);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await signUp(email, password, fullName, username);
        toast({
            title: 'Account created.',
            description: "Welcome! You have been signed up successfully.",
        });
        router.push('/dashboard');
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
      router.push('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Authentication Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };
  
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-image-1');

  const socialIcons = [
     {
      name: 'Google',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.612-3.512-11.283-8.192l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.712 34.755 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>,
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
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <div
          className={styles.leftSection}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={gradientBlobRef}
            className={`${styles.gradientBlob} ${isHovering ? styles.visible : ''}`}
          />
          <div className={styles.formContent}>
            <form className={styles.signupForm} onSubmit={handleSubmit}>
              <div className={styles.formFields}>
                <h1 className={styles.heading}>Create Account</h1>
              </div>
              
              <div className={styles.formFields}>
                  <AppInput placeholder="Full Name" type="text" value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} />
                  <AppInput placeholder="Username" type="text" value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} />
                  <AppInput placeholder="Email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                  <AppInput placeholder="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
              </div>

              <div className='flex gap-4 justify-center items-center mt-4'>
                 <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md bg-[var(--color-border)] px-8 py-3 font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="text-sm px-2 py-1">Sign Up</span>}
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

              <div className="social-container">
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
                Already have an account?{' '}
                <Link href="/login" className="underline text-[var(--color-text-primary)]">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
        <div className={styles.rightSection}>
            {loginImage && <Image
              src={loginImage.imageUrl}
              loader={({ src }) => src}
              fill
              priority
              alt={loginImage.description}
              data-ai-hint={loginImage.imageHint}
              className={styles.imagePlaceholder}
            />}
       </div>
      </div>
    </div>
  )
}
