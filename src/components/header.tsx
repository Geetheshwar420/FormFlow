'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, UserPlus } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/firebase/auth/use-auth";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

export function Header() {
  const { user, isUserLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {isClient ? <SidebarTrigger /> : <div className="h-7 w-7" />}
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {isClient && (
          <>
            {isUserLoading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : user ? (
               <Link href="/profile" passHref>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        width={40}
                        height={40}
                        alt="User Avatar"
                        data-ai-hint="person face"
                        className="rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="rounded-full">{user.email?.[0].toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" passHref>
                  <Button variant="outline">
                    <LogIn />
                    Login
                  </Button>
                </Link>
                <Link href="/signup" passHref>
                  <Button>
                    <UserPlus />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
