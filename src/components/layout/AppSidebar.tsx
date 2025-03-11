
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

// Mock status - Will be replaced with actual API data
const whatsappStatus = {
  connected: true,
  lastConnection: "2023-08-15T14:30:00"
};

const telegramStatus = {
  connected: false,
  lastConnection: "2023-08-15T12:45:00"
};

const databaseStatus = {
  connected: true,
  ping: "24ms"
};

export function AppSidebar() {
  const { open, toggleSidebar } = useSidebar();
  
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
          whatsappStatus={whatsappStatus}
          telegramStatus={telegramStatus}
          databaseStatus={databaseStatus}
        />
        
        {/* Logout button */}
        <SidebarSeparator />
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
