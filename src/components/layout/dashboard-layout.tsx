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
          collapsed ? "md:ml-[70px]" : "md:ml-[260px]"
        )}
      >
        <Navbar user={user} onMenuToggle={() => setCollapsed(!collapsed)} />

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
