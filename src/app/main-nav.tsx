"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Target,
  HelpCircle,
  BookUser,
  MessagesSquare,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume-enhancer", label: "Resume Enhancer", icon: Sparkles },
  { href: "/ats-checker", label: "ATS Checker", icon: Target },
  { href: "/mcq-test", label: "MCQ Test", icon: HelpCircle },
  { href: "/tutoring", label: "AI Tutor", icon: BookUser },
  { href: "/mock-interview", label: "Mock Interview", icon: MessagesSquare },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
