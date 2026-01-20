import type { Metadata } from "next";
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

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const fontHeadline = Inter({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: "FormFlow",
  description:
    "An advanced survey and form builder to create, customize, and distribute surveys and forms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
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
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
