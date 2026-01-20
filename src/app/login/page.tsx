'use client'

import * as React from 'react';
import {
  useEffect,
  useState,
} from 'react';
import Image from 'next/image';
import { useAuth } from '@/firebase/auth/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

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
      { label && 
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

// The main page component
export default function LoginPage() {
  const { user, isUserLoading, signIn, isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);


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
    try {
        await signIn(email, password);
        toast({
            title: 'Signed in.',
            description: "Welcome back! You're logged in.",
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
  
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-image-1');

  const socialIcons = [
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"/></svg>,
      href: '#',
      gradient: 'bg-[var(--color-bg)]',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 5a2 2 0 1 1-4-.002a2 2 0 0 1 4 .002M7 8.48H3V21h4zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z"/></svg>,
      href: '#',
      bg: 'bg-[var(--color-bg)]',
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z"/></svg>,
      href: '#',
      bg: 'bg-[var(--color-bg)]',
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
    <div className="h-screen w-full bg-[var(--color-bg)] flex items-center justify-center p-4 text-[var(--color-text-primary)]">
      <div className='w-full max-w-4xl flex justify-between h-[600px] bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden'>
        <div
          className='w-full lg:w-1/2 p-8 flex flex-col justify-center h-full relative overflow-hidden'
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-300/30 via-blue-300/30 to-pink-300/30 rounded-full blur-3xl transition-opacity duration-200 ${
              isHovering ? 'opacity-100' : 'opacity-0'
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
                <div className="social-container">
                  <div className="flex items-center justify-center">
                    <ul className="flex gap-3 md:gap-4">
                      {socialIcons.map((social, index) => (
                        <li key={index} className="list-none">
                          <a
                            href={social.href}
                            className="w-[2.5rem] h-[2.5rem] bg-[var(--color-bg-2)] rounded-full flex justify-center items-center relative z-[1] border-2 border-[var(--color-border)] overflow-hidden group"
                          >
                            <div
                              className={`absolute inset-0 w-full h-full ${social.gradient || social.bg} scale-y-0 origin-bottom transition-transform duration-500 ease-in-out group-hover:scale-y-100`}
                            />
                            <span className="text-[1.5rem] text-[var(--color-text-secondary)] transition-all duration-500 ease-in-out z-[2] group-hover:text-[var(--color-text-primary)]">
                              {social.icon}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <span className='text-sm text-[var(--color-text-secondary)]'>or use your account</span>
              
              <div className='grid gap-4 items-center mt-4'>
                  <AppInput placeholder="Email" type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                  <AppInput placeholder="Password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
              </div>

              <a href="#" className='font-light text-sm md:text-md text-[var(--color-text-secondary)]'>Forgot your password?</a>

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
  )
}
