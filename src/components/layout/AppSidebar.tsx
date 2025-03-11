
import { Users, FileText, Bell, Settings, Trash2, LayoutDashboard, Wifi, WifiOff, Database, CheckCircle, XCircle } from "lucide-react";
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
