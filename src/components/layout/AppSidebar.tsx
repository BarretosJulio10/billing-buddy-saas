
import { Users, FileText, Bell, Settings, Trash2, LayoutDashboard, Wifi, WifiOff, Database, MessageCircle, MessageCircleOff } from "lucide-react";
import { Link } from "react-router-dom";
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
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sistema de Mensalidades</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
          
          <div className="flex items-center justify-between gap-2">
            {/* WhatsApp Status */}
            <div className="flex items-center gap-1.5">
              {whatsappStatus.connected ? (
                <Wifi className="h-4 w-4 text-emerald-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              <div className={`h-1.5 w-1.5 rounded-full ${whatsappStatus.connected ? 'bg-emerald-500' : 'bg-destructive'}`}></div>
            </div>

            {/* Telegram Status */}
            <div className="flex items-center gap-1.5">
              {telegramStatus.connected ? (
                <MessageCircle className="h-4 w-4 text-blue-500" />
              ) : (
                <MessageCircleOff className="h-4 w-4 text-destructive" />
              )}
              <div className={`h-1.5 w-1.5 rounded-full ${telegramStatus.connected ? 'bg-blue-500' : 'bg-destructive'}`}></div>
            </div>
            
            {/* Database Status */}
            <div className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-blue-500" />
              <div className={`h-1.5 w-1.5 rounded-full ${databaseStatus.connected ? 'bg-blue-500' : 'bg-destructive'}`}></div>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
