'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { usePathname } from "next/navigation";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontHeadline = Inter({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-headline",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Define which routes should show the app layout (sidebar + header)
  const appRoutes = ['/dashboard', '/analytics', '/profile', '/forms', '/settings', '/help', '/billing'];
  const isAppPage = appRoutes.some(route => pathname.startsWith(route));

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>FormFlow</title>
        <meta
          name="description"
          content="An advanced survey and form builder to create, customize, and distribute surveys and forms."
        />
      </head>
      <body
        className={cn(
          "font-body antialiased",
          fontBody.variable,
          fontHeadline.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {isAppPage ? (
                <SidebarProvider>
                  <Sidebar collapsible="icon" className="border-r border-sidebar-border/50">
                    <SidebarNav />
                  </Sidebar>
                  <SidebarInset className="flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                      {children}
                    </main>
                  </SidebarInset>
                </SidebarProvider>
            ) : (
                <>{children}</>
            )}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
