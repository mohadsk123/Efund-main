"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, DollarSign, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Import cn for className merging
import { useNavigate } from "react-router-dom";

const quickLinks = [
  {
    name: "View Beneficiaries",
    icon: Users,
    action: () => toast.info("Navigating to Beneficiaries..."),
    path: "/beneficiaries",
  },
  {
    name: "Check Transactions",
    icon: DollarSign,
    action: () => toast.info("Navigating to Transactions..."),
    path: "/transactions",
  },
  {
    name: "Explore Schemes",
    icon: FileText,
    action: () => toast.info("Navigating to Schemes..."),
    path: "/schemes",
  },
  {
    name: "Check Eligibility",
    icon: CheckCircle,
    action: () => toast.info("Navigating to Eligibility Checker..."),
    path: "/eligibility",
  },
  {
    name: "Add New Scheme",
    icon: FileText,
    action: () => toast.info("Add New Scheme functionality coming soon!"),
    path: "/schemes", // Could be a modal or specific add page
  },
];

interface QuickLinksCarouselProps {
  className?: string;
}

const QuickLinksCarousel = ({ className }: QuickLinksCarouselProps) => {
  const navigate = useNavigate();
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  return (
    <Card className={cn("col-span-full bg-card text-card-foreground border-border shadow-sm", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex space-x-4 pb-2">
            {quickLinks.map((link, index) => (
              <div key={index} className="embla__slide flex-none w-48">
                <Button
                  variant="outline"
                  className="h-24 w-full flex flex-col items-center justify-center gap-2 text-base border-border dark:neon-hover"
                  onClick={() => { link.action(); navigate(link.path); }}
                >
                  <link.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{link.name}</span>
                </Button>
              </div>
            ))}
            <div className="embla__slide flex-none w-48">
              <Button
                variant="outline"
                className="h-24 w-full flex flex-col items-center justify-center gap-2 text-base border-border dark:neon-hover"
                onClick={() => toast.info("View all actions...")}
              >
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">View All</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLinksCarousel;
