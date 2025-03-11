
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <div className="min-h-screen flex w-full bg-background relative">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto w-full">
          <div className="w-full mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
