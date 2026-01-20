import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Find answers to your questions.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Here are some common questions about FormFlow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create a new form?</AccordionTrigger>
              <AccordionContent>
                You can create a new form by clicking the &quot;Create New Form&quot; button on the dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How can I see my form responses?</AccordionTrigger>
              <AccordionContent>
                You can view form responses by clicking on the &quot;Analytics&quot; button on the form card in your dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I share my forms?</AccordionTrigger>
              <AccordionContent>
                Yes, you can share your form with a public link by clicking the &quot;Share&quot; button.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
