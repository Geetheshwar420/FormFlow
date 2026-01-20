import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormFlowLogo } from "@/components/icons";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, BarChart, SlidersHorizontal, Share2 } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <FormFlowLogo className="w-8 h-8" />
            <span className="font-bold hidden sm:inline-block">FormFlow</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link
              href="#features"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost" })}
            >
              Login
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "sm" })}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-32 lg:py-40">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-6">
              Create Beautiful Forms Effortlessly
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              An advanced builder to create, customize, and distribute surveys
              and forms. Get the data you need to make better decisions.
            </p>
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Get Started Free
            </Link>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">
              Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<SlidersHorizontal />}
                title="Drag & Drop Builder"
                description="Easily create and customize your forms with our intuitive drag-and-drop interface."
              />
              <FeatureCard
                icon={<BarChart />}
                title="Real-time Analytics"
                description="Track responses as they come in and visualize your data with beautiful charts."
              />
              <FeatureCard
                icon={<Check />}
                title="Conditional Logic"
                description="Create dynamic forms that show or hide questions based on user answers."
              />
              <FeatureCard
                icon={<Share2 />}
                title="Easy Sharing"
                description="Share your forms with a simple link and collect responses from anywhere."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container py-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} FormFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
                <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm"})}>Login</Link>
                <Link href="/signup" className={buttonVariants({ variant: "ghost", size: "sm"})}>Sign Up</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 bg-background rounded-lg shadow-sm">
      <div className="inline-block p-4 bg-primary/10 text-primary rounded-full mb-4">
        {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-xl font-bold font-headline mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
