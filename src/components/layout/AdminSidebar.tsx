
import { LayoutDashboard, Users, Settings, LogOut, Building } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Empresas",
    url: "/admin/organizations",
    icon: Building,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">PagouPix Admin</span>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url || 
                              (item.url !== "/admin" && location.pathname.startsWith(item.url))}
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
          <Button variant="outline" onClick={signOut} className="w-full flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
