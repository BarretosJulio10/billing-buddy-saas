
import { Users, FileText, Bell, Settings, Trash2, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  SidebarMenu as Menu,
  SidebarMenuItem as MenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { SidebarMenuItem } from "./SidebarMenuItem";

// Menu items definition - extracted for easier maintenance
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

export function SidebarMenu() {
  const location = useLocation();

  return (
    <Menu>
      {menuItems.map((item) => (
        <SidebarMenuItem
          key={item.title}
          title={item.title}
          url={item.url}
          icon={item.icon}
          isActive={location.pathname === item.url || 
                   (item.url !== "/" && location.pathname.startsWith(item.url))}
        />
      ))}
      
      {/* Lixeira item added separately for easier maintenance */}
      <MenuItem>
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
      </MenuItem>
    </Menu>
  );
}
