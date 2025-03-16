
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { ReactNode } from 'react';
import { ImpersonationBanner } from "../ImpersonationBanner";
import { Navigate } from "react-router-dom";
import { SubscriptionAlert } from "../subscription/SubscriptionAlert";
import { OrganizationProvider } from "@/providers/OrganizationProvider";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { signOut, isBlocked, organization } = useAuth();

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

  if (isBlocked) {
    return <Navigate to="/blocked" />;
  }

  return (
    <>
      <ImpersonationBanner />
      <OrganizationProvider>
        <SidebarProvider defaultOpen={sidebarOpen}>
          <div className="min-h-screen flex w-full bg-background relative">
            <AppSidebar />
            <main className="flex-1 p-4 md:p-6 overflow-auto w-full">
              <div className="w-full mx-auto fade-in">
                {organization?.subscriptionExpiringSoon && <SubscriptionAlert />}
                <div className="flex justify-end mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2" 
                    onClick={signOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </OrganizationProvider>
    </>
  );
}

export default AppLayout;
