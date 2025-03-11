import { Users, FileText, Bell, Settings, Trash2, LayoutDashboard, Wifi, WifiOff, Database, MessageCircle, MessageCircleOff, Menu } from "lucide-react";
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
  {
    title: "Lixeira",
    url: "/trash",
    icon: Trash2,
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator />
        <div className="px-3 py-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">Status do Sistema</div>
          
          {/* WhatsApp Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {whatsappStatus.connected ? (
                <Wifi className="h-4 w-4 text-emerald-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              <span className="text-xs">WhatsApp</span>
            </div>
            <div>
              {whatsappStatus.connected ? (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-destructive mr-1"></div>
                  <span className="text-xs text-muted-foreground">Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Telegram Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {telegramStatus.connected ? (
                <MessageCircle className="h-4 w-4 text-blue-500" />
              ) : (
                <MessageCircleOff className="h-4 w-4 text-destructive" />
              )}
              <span className="text-xs">Telegram</span>
            </div>
            <div>
              {telegramStatus.connected ? (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-destructive mr-1"></div>
                  <span className="text-xs text-muted-foreground">Offline</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Database Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-xs">Banco de Dados</span>
            </div>
            <div>
              {databaseStatus.connected ? (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-destructive mr-1"></div>
                  <span className="text-xs text-muted-foreground">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
