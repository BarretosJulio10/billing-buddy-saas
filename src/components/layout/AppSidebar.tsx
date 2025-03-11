
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarMenu, SystemStatus, LogoutButton } from "./sidebar";

// Define the service status interface
interface ServiceStatus {
  connected: boolean;
  lastConnection?: string;
  ping?: string;
}

export function AppSidebar() {
  const { open, toggleSidebar } = useSidebar();
  const [statusData, setStatusData] = useState({
    whatsappStatus: { connected: false, lastConnection: "" },
    telegramStatus: { connected: false, lastConnection: "" },
    databaseStatus: { connected: false, ping: "" }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real-time status data
    const fetchStatusData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('/api/system/status');
        if (!response.ok) {
          throw new Error('Failed to fetch status data');
        }
        const data = await response.json();
        
        setStatusData({
          whatsappStatus: data.whatsapp || { connected: false, lastConnection: "" },
          telegramStatus: data.telegram || { connected: false, lastConnection: "" },
          databaseStatus: data.database || { connected: false, ping: "" }
        });
      } catch (error) {
        console.error('Error fetching status data:', error);
        // Set default status values on error
        setStatusData({
          whatsappStatus: { connected: false, lastConnection: "" },
          telegramStatus: { connected: false, lastConnection: "" },
          databaseStatus: { connected: false, ping: "" }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();

    // Set up polling to refresh status every 1 minute
    const pollingInterval = setInterval(fetchStatusData, 60000);

    return () => clearInterval(pollingInterval);
  }, []);
  
  return (
    <Sidebar className={open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center">
              <SidebarTrigger 
                className="md:hidden h-5 w-5 mr-2" 
                onClick={(e) => {
                  e.preventDefault();
                  toggleSidebar();
                }}
              >
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <SidebarGroupLabel>PagouPix</SidebarGroupLabel>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator />
        <SystemStatus 
          whatsappStatus={statusData.whatsappStatus}
          telegramStatus={statusData.telegramStatus}
          databaseStatus={statusData.databaseStatus}
          loading={loading}
        />
        
        <SidebarSeparator />
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
