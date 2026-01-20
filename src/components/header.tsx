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
import { Search, Bell, LogIn, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useAuth } from "@/firebase/auth/use-auth";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const { user, signOut, isUserLoading } = useAuth();
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search forms..."
          className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
        />
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>

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
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
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
