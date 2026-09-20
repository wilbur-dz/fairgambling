"use client";

import type { ReactNode } from "react";
import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/sidebar-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/header/site-header";
import { SearchProvider } from "@/components/search/search-provider";
import { BtnGrowPop } from "@/components/ui/btn-grow-pop";

function AppShellFrame({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#2a274e] dark:bg-dark-bg dark:text-white">
      <DesktopSidebar />
      <MobileBottomNav />
      <div
        className={`flex min-h-screen flex-col pb-[calc(88px+env(safe-area-inset-bottom))] transition-[margin] duration-300 md:pb-0 ${
          collapsed ? "md:ml-[104px]" : "md:ml-[304px]"
        }`}
      >
        <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-1 flex-col overflow-x-clip">
          <div className="flex flex-1 flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
          </div>
          <SiteFooter />
        </div>
      </div>
      <BtnGrowPop />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <SearchProvider>
          <SidebarProvider>
            <AppShellFrame>{children}</AppShellFrame>
          </SidebarProvider>
        </SearchProvider>
      </AuthModalProvider>
    </AuthProvider>
  );
}
