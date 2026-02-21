"use client";

import React, { useMemo } from "react";
import { Bell, CheckCircle, Info, UserPlus, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useDataApi } from "@/hooks/use-data-api";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  new?: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: "d1",
    icon: <Info className="h-4 w-4 text-blue-500" />,
    title: "System Maintenance",
    description: "Blockchain network upgrade scheduled for midnight.",
    time: "1 hour ago",
  },
  {
    id: "d2",
    icon: <UserPlus className="h-4 w-4 text-purple-500" />,
    title: "New Scheme Live",
    description: "PM Awas Yojana Phase 3 is now accepting applications.",
    time: "3 hours ago",
  }
];

const NotificationBell = () => {
  const { applications, disbursements } = useDataApi();

  const realNotifications = useMemo(() => {
    const notes: Notification[] = [];

    // Add application status updates
    applications.forEach((app) => {
      if (app.status === "Approved") {
        notes.push({
          id: `app-${app._id}`,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          title: "Application Approved",
          description: `Your application for ${app.schemeName} has been approved on-chain.`,
          time: formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true }),
          new: true
        });
      }
    });

    // Add recent disbursements
    disbursements.slice(0, 3).forEach((d, i) => {
      notes.push({
        id: `disb-${i}`,
        icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
        title: "Funds Disbursed",
        description: `Ξ${parseFloat(d.amount).toFixed(4)} sent to ${d.beneficiaryAddress.substring(0, 6)}...`,
        time: formatDistanceToNow(new Date(d.timestamp * 1000), { addSuffix: true }),
      });
    });

    return notes;
  }, [applications, disbursements]);

  const allNotifications = [...realNotifications, ...dummyNotifications];
  const newCount = realNotifications.filter(n => n.new).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted dark:neon-hover">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {newCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs animate-pulse-glow">
              {newCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-card text-card-foreground border-border shadow-lg" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">Notifications</h4>
          {newCount > 0 && <Badge variant="secondary">{newCount} New</Badge>}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {allNotifications.length > 0 ? (
              allNotifications.map((n) => (
                <div key={n.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-accent/50 transition-colors mb-1">
                  <div className="mt-1">{n.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="h-2 w-2" /> {n.time}
                    </p>
                  </div>
                  {n.new && <div className="h-2 w-2 bg-primary rounded-full mt-2" />}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;