
import { LogOut } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function LogoutButton() {
  const { signOut } = useAuth();
  
  return (
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
  );
}
