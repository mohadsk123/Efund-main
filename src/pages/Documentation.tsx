"use client";

import { Book, FileText } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Documentation = () => {
  return (
    <div className="flex flex-col gap-8 px-6 py-8 animate-fade-in-up">
      <div className="flex items-center gap-3 text-primary">
        <Book className="h-7 w-7" />
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Documentation</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Find comprehensive guides and information about the E-Fund System.
      </p>

      <Card className="bg-card text-card-foreground border-border shadow-sm animate-fade-in-up delay-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">System Guides</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-border dark:neon-hover">
              <AccordionTrigger className="text-foreground hover:no-underline text-base py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Getting Started with E-Fund
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground p-4 text-sm">
                <p className="mb-2">
                  Welcome to the E-Fund System! This guide will walk you through the initial setup and key features.
                  Learn how to navigate the dashboard, connect your wallet, and understand the basic overview of the system.
                </p>
                <p>
                  Our blockchain-powered platform ensures transparency and security in all transactions.
                  Familiarize yourself with the core concepts of decentralized finance and how it applies to government schemes.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b border-border dark:neon-hover">
              <AccordionTrigger className="text-foreground hover:no-underline text-base py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Managing Beneficiaries and Schemes
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground p-4 text-sm">
                <p className="mb-2">
                  This section covers how to effectively manage beneficiaries and government schemes.
                  You'll learn how to add new beneficiaries, update existing records, and track their eligibility status.
                </p>
                <p>
                  For schemes, discover how to view scheme details, monitor their performance, and understand the disbursement processes.
                  The system provides tools for efficient administration and oversight.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b border-border dark:neon-hover">
              <AccordionTrigger className="text-foreground hover:no-underline text-base py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Understanding Transactions and Analytics
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground p-4 text-sm">
                <p className="mb-2">
                  Dive deep into the transaction history and analytics features of the E-Fund System.
                  Understand how to filter and search for specific transactions, interpret transaction statuses, and export data.
                </p>
                <p>
                  The analytics dashboard provides visual insights into fund disbursement trends, transaction volumes,
                  and overall scheme performance, helping you make informed decisions.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-b border-border dark:neon-hover">
              <AccordionTrigger className="text-foreground hover:no-underline text-base py-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Security and Best Practices
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground p-4 text-sm">
                <p className="mb-2">
                  Security is paramount. This guide outlines the security measures implemented in the E-Fund System
                  and best practices for users. Learn about two-factor authentication, password management,
                  and how to review your login activity.
                </p>
                <p>
                  We encourage all users to follow recommended security protocols to protect their accounts and sensitive information.
                  Regularly review your security settings and report any suspicious activity.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documentation;