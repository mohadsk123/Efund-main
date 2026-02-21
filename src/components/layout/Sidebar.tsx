"use client";

import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  BarChart2,
  Users,
  DollarSign,
  FileText,
  Shield,
  Book,
  LifeBuoy,
  Settings,
  CheckCircle,
  Code,
  User,
  PlusSquare,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

interface SidebarProps {
  isCollapsed: boolean;
}

const navItems = [
  { name: "Overview", icon: LayoutDashboard, path: "/" },
  { name: "My Profile", icon: User, path: "/profile" },
  { name: "Admin", icon: Shield, path: "/admin" },
  { name: "Admin Schemes", icon: PlusSquare, path: "/admin-schemes" },
  { name: "Admin Applications", icon: ClipboardList, path: "/admin-applications" },
  { name: "Admin Users", icon: Users, path: "/admin-users" },
  { name: "Eligibility", icon: CheckCircle, path: "/eligibility" },
  { name: "Analytics", icon: BarChart2, path: "/analytics" },
  { name: "Beneficiaries", icon: Users, path: "/beneficiaries" },
  { name: "Transactions", icon: DollarSign, path: "/transactions" },
  { name: "Apply", icon: CheckCircle, path: "/apply" },
  { name: "Schemes", icon: FileText, path: "/schemes" },
  { name: "Contract Interact", icon: Code, path: "/contract-interaction" },
  { name: "Security", icon: Shield, path: "/security" },
  { name: "Documentation", icon: Book, path: "/documentation" },
  { name: "Support", icon: LifeBuoy, path: "/support" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const { session } = useAuth();
  const isAdmin = session?.role === "admin";
  const filtered = navItems.filter(item => {
    const isAdminRoute = item.path.startsWith("/admin");
    return isAdminRoute ? isAdmin : true;
  });
  return (
    <aside className={cn("flex flex-col h-full border-r border-sidebar-border bg-sidebar-background text-sidebar-foreground transition-all duration-300", isCollapsed ? "w-16" : "w-64")}>
      <div className="flex items-center justify-center h-16 border-b border-sidebar-border">
        <Logo appName={isCollapsed ? "" : "E-Fund System"} iconClassName="h-8 w-8" />
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {filtered.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
