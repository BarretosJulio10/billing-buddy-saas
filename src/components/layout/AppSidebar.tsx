
import { Users, FileText, Bell, Settings, Trash2, LayoutDashboard, Wifi, WifiOff, Database, MessageCircle, MessageCircleOff, Menu, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Faturas",
    url: "/invoices",
    icon: FileText,
  },
  {
    title: "Cobranças",
    url: "/collections",
    icon: Bell,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

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
  const location = useLocation();
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
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url || 
                              (item.url !== "/" && location.pathname.startsWith(item.url))}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Lixeira moved here, separate from the main menu items */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={location.pathname === "/trash" || 
                            location.pathname.startsWith("/trash")}
                  tooltip="Lixeira"
                >
                  <Link to="/trash" className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5" />
                    <span>Lixeira</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator />
        <div className="px-3 py-2">
          <div className="text-sm font-medium mb-2">Status do Sistema</div>
          
          {/* WhatsApp Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">WhatsApp</span>
            </div>
            <div>
              {whatsappStatus.connected ? (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></div>
                  <span className="text-sm text-emerald-500">Online</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-destructive mr-1.5"></div>
                  <span className="text-sm text-destructive">Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Telegram Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Telegram</span>
            </div>
            <div>
              {telegramStatus.connected ? (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></div>
                  <span className="text-sm text-blue-500">Online</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-destructive mr-1.5"></div>
                  <span className="text-sm text-destructive">Offline</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Database Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Banco de Dados</span>
            </div>
            <div>
              {databaseStatus.connected ? (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></div>
                  <span className="text-sm text-blue-500">Online</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-destructive mr-1.5"></div>
                  <span className="text-sm text-destructive">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sair button moved to the bottom margin */}
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
