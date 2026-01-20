import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormFlowLogo } from "@/components/icons";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');
  const featureImage1 = PlaceHolderImages.find(p => p.id === 'landing-feature-1');
  const featureImage2 = PlaceHolderImages.find(p => p.id === 'landing-feature-2');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            <Link
              href="#faq"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
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
        <section className="relative py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,hsl(var(--primary)/0.15),transparent)]"></div>
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-6">
              A New Era of Data Collection
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              An advanced builder to create, customize, and distribute surveys
              and forms. Get the data you need to make better decisions.
            </p>
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Get Started Free
            </Link>
            {heroImage && <div className="relative mt-16 md:mt-24 max-w-5xl mx-auto">
               <div className="absolute -inset-4">
                  <div className="w-full h-full mx-auto rotate-12 max-w-5xl bg-gradient-to-r from-primary/20 to-primary/50 rounded-full blur-3xl" />
                </div>
              <Image
                src={heroImage.imageUrl}
                width={1200}
                height={700}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                className="rounded-lg border-2 border-primary/20 shadow-2xl shadow-primary/20"
                priority
              />
            </div>}
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                Meet the New-Gen Research Experience
                </h2>
                <p className="text-muted-foreground">
                Our platform provides a comprehensive suite of tools to create, analyze, and share your forms, giving you actionable insights faster than ever.
                </p>
            </div>
            <div className="mt-16 grid gap-16">
              {featureImage1 && <FeatureItem
                icon={<SlidersHorizontal />}
                title="Intuitive Drag & Drop Builder"
                description="Easily create and customize your forms with our intuitive drag-and-drop interface. No coding required. Just drag, drop, and you're ready to go."
                image={{
                  src: featureImage1.imageUrl,
                  alt: featureImage1.description,
                  hint: featureImage1.imageHint
                }}
              />}
              {featureImage2 && <FeatureItem
                icon={<BarChart />}
                title="Real-time Analytics"
                description="Track responses as they come in and visualize your data with beautiful charts. Understand your audience at a glance and make data-driven decisions."
                 image={{
                  src: featureImage2.imageUrl,
                  alt: featureImage2.description,
                  hint: featureImage2.imageHint
                }}
                reverse
              />}
            </div>
          </div>
        </section>

        <section id="faq" className="py-20 bg-muted/50">
          <div className="container max-w-3xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                    Frequently asked questions
                </h2>
                <p className="text-muted-foreground">
                    Can't find the answer you're looking for? Reach out to our support team.
                </p>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
                <AccordionItem value="item-1">
                <AccordionTrigger>How do I create a new form?</AccordionTrigger>
                <AccordionContent>
                    You can create a new form by clicking the "Create New Form" button on the dashboard after signing in.
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                <AccordionTrigger>How can I see my form responses?</AccordionTrigger>
                <AccordionContent>
                    You can view form responses by clicking on the "Analytics" button on the form card in your dashboard. This will take you to a detailed analytics page with charts and filters.
                </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                <AccordionTrigger>Can I share my forms?</AccordionTrigger>
                <AccordionContent>
                    Yes, you can share your form with a public link by clicking the "Share" button on the form card. This will copy a unique URL to your clipboard.
                </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                <AccordionTrigger>What data export options are available?</AccordionTrigger>
                <AccordionContent>
                    From the analytics page, you can export your form responses in various formats, including CSV, JSON, and PDF, for easy reporting and data archival.
                </AccordionContent>
                </AccordionItem>
            </Accordion>
          </div>
        </section>
        
        <section className="py-20 md:py-32">
            <div className="container text-center">
                 <FormFlowLogo className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter mb-6">
                    Start Building Better Forms Today
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                    Sign up for free and experience the next generation of data collection. No credit card required.
                </p>
                <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                Sign Up Now
                </Link>
            </div>
        </section>
      </main>
      <footer className="border-t bg-muted/50">
        <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <Link href="#features" className="hover:text-foreground">Features</Link>
                    <Link href="/login" className="hover:text-foreground">Login</Link>
                    <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
                </nav>
            </div>
             <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground">About Us</a>
                    <a href="#" className="hover:text-foreground">Careers</a>
                    <a href="#" className="hover:text-foreground">Contact</a>
                </nav>
            </div>
             <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground">Blog</a>
                    <a href="#faq" className="hover:text-foreground">FAQ</a>
                    <a href="/help" className="hover:text-foreground">Support</a>
                </nav>
            </div>
             <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <a href="#" className="hover:text-foreground">Terms of Service</a>
                    <a href="#" className="hover:text-foreground">Privacy Policy</a>
                </nav>
            </div>
        </div>
        <div className="container py-6 flex items-center justify-between border-t">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} FormFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
                {/* Social icons can go here */}
            </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  image,
  reverse = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: { src: string; alt: string, hint: string };
  reverse?: boolean;
}) {
  return (
    <div className={cn("grid md:grid-cols-2 gap-8 md:gap-12 items-center", reverse && "md:grid-flow-col-dense")}>
      <div className={cn(reverse && "md:col-start-2")}>
        <div className="inline-block p-3 bg-primary/10 text-primary rounded-lg mb-4">
          {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
        </div>
        <h3 className="text-2xl font-bold font-headline mb-4">{title}</h3>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>
      <div className={cn("relative h-full min-h-[250px]", reverse && "md:col-start-1")}>
        <Image
          src={image.src}
          fill
          alt={image.alt}
          data-ai-hint={image.hint}
          className="rounded-lg object-cover border-2 border-primary/10"
        />
      </div>
    </div>
  );
}
