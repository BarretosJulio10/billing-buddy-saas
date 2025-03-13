
import { Organization } from "@/types/organization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrganizationHeaderProps {
  organization: Organization;
  onToggleBlock: () => void;
}

export function OrganizationHeader({ organization, onToggleBlock }: OrganizationHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2" 
            onClick={() => navigate('/admin/organizations')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          {organization.blocked && (
            <Badge variant="destructive">Bloqueado</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Detalhes da empresa e gerenciamento
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant={organization.blocked ? "default" : "destructive"}
          onClick={onToggleBlock}
          className="flex items-center gap-2"
        >
          {organization.blocked ? (
            <>
              <Unlock className="h-4 w-4" />
              Desbloquear
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Bloquear
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
