import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Logo } from "@/components/logo";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          {/* Can add footer items here later */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
