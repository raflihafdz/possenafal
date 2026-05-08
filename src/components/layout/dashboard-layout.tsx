"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        role={user.role}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div
        className={cn(
          "transition-all duration-300",
          "ml-0 md:ml-65",
          collapsed && "md:ml-17.5"
        )}
      >
        <Navbar user={user} onMenuToggle={() => setCollapsed(!collapsed)} />

        <main className="p-2 sm:p-3 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
