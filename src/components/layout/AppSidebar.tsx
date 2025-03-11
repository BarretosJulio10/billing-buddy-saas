
import { LogOut, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { SidebarMenu, SystemStatus } from "./sidebar";

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
  const { signOut } = useAuth();
  
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
        
        {/* Sair button */}
        <SidebarSeparator />
        <div className="px-2 py-2">
          <SidebarMenuButton 
            onClick={signOut}
            tooltip="Sair"
            className="w-full justify-start"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </div>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
