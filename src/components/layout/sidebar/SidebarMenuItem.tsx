
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import {
  SidebarMenuItem as MenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

interface SidebarMenuItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
}

export function SidebarMenuItem({ title, url, icon: Icon, isActive }: SidebarMenuItemProps) {
  return (
    <MenuItem>
      <SidebarMenuButton 
        asChild
        isActive={isActive}
        tooltip={title}
      >
        <Link to={url} className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </MenuItem>
  );
}
