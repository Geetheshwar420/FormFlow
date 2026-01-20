'use client';

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, UserPlus } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/firebase/auth/use-auth";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const { user, signOut, isUserLoading } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger />
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <ThemeToggle />

        {isUserLoading ? (
           <Avatar className="h-10 w-10 animate-pulse bg-muted" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                   {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      width={40}
                      height={40}
                      alt="User Avatar"
                      data-ai-hint="person face"
                    />
                  ) : (
                     <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile" passHref>
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </Link>
              <Link href="/billing" passHref>
                <DropdownMenuItem>Billing</DropdownMenuItem>
              </Link>
              <Link href="/settings" passHref>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      </div>
    </header>
  );
}
