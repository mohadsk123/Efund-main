"use client";

import { useState } from "react";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const Support = () => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !message) {
      toast.error("Please fill in all fields.");
      return;
    }
    // Simulate sending email
    toast.success("Your message has been sent! We'll get back to you shortly.");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const faqItems = [
    {
      question: "How do I connect my wallet?",
      answer: "You can connect your wallet by clicking the 'Connect Wallet' button in the top right corner of the dashboard. A dialog will appear, allowing you to select from various supported wallets like MetaMask, Rabby, etc. Follow the on-screen prompts to authorize the connection.",
    },
    {
      question: "What if my transaction fails?",
      answer: "If a transaction fails, please check your wallet balance and network connection. You can also review the transaction details on the 'Transactions' page for more information. If the issue persists, please contact support with your transaction ID.",
    },
    {
      question: "How is my data secured?",
      answer: "Your data is secured using industry-standard encryption and blockchain technology. We implement robust security measures, including two-factor authentication and regular security audits, to protect your information. All sensitive data is handled with the utmost care.",
    },
    {
      question: "Can I track the status of a scheme?",
      answer: "Yes, you can track the status of various government schemes on the 'Schemes' page. Each scheme card provides an overview, and you can click 'View Details' for more in-depth information, including beneficiary numbers and current status.",
    },
  ];

  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <LifeBuoy className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Support Center</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Find answers to common questions or contact our support team for assistance.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Quick answers to the most common questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={`faq-${index}`} value={`item-${index}`} className="border-b border-border dark:neon-hover">
                  <AccordionTrigger className="text-foreground hover:no-underline text-base text-left py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground p-4 text-sm">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" /> Contact Support
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Can't find what you're looking for? Send us a message.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-base">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Issue with transactions"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-muted text-muted-foreground border-border h-10 text-base dark:neon-focus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-base">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="bg-muted text-muted-foreground border-border text-base dark:neon-focus"
                />
              </div>
              <Button type="submit" className="w-full h-10 text-base dark:neon-hover">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;