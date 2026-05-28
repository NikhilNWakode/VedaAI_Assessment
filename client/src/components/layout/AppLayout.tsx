"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      {/* Desktop sidebar — floating, always visible on lg+ */}
      <div className="hidden lg:fixed lg:top-3 lg:left-3 lg:z-40 lg:block lg:h-[calc(100vh-24px)]">
        <Sidebar />
      </div>
      {/* Spacer to offset content for the fixed sidebar */}
      <div className="hidden lg:block lg:w-[328px] lg:shrink-0" />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 transition-opacity"
            onClick={closeSidebar}
          />
          {/* Sidebar panel */}
          <div className="relative z-10 h-full p-3">
            <Sidebar onClose={closeSidebar} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={openSidebar} />
        <main className="flex-1 overflow-y-auto pt-[140px] pb-20 lg:pt-[72px] lg:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
