"use client";

import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer"; // Import the new Footer component

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={15}
          minSize={isSidebarCollapsed ? 5 : 15}
          maxSize={isSidebarCollapsed ? 5 : 20}
          collapsible={true}
          collapsedSize={5}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          className="min-w-[64px]" // Ensure it doesn't shrink too much
        >
          <Sidebar isCollapsed={isSidebarCollapsed} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={85}>
          <div className="flex flex-col h-full">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 bg-background text-foreground">
              <Outlet />
            </main>
            <Footer /> {/* Add the Footer here */}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default DashboardLayout;
