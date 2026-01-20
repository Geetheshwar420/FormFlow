"use client";

import Link from "next/link";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { FormFlowLogo } from "./icons";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Settings,
  HelpCircle,
  CreditCard,
} from "lucide-react";

const menuItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/billing",
    label: "Billing",
    icon: CreditCard,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <FormFlowLogo className="w-8 h-8 text-primary" />
          <span className="font-headline text-2xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            FormFlow
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
         <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/help">
                    <SidebarMenuButton tooltip="Help" isActive={pathname === '/help'}>
                        <HelpCircle/>
                        <span>Help & Support</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
