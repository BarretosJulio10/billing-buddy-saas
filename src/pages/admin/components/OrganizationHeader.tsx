
import { Building } from "lucide-react";
import { Organization } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface OrganizationHeaderProps {
  organization: Organization;
  onToggleBlock: () => void;
}

export function OrganizationHeader({ organization, onToggleBlock }: OrganizationHeaderProps) {
  const navigate = useNavigate();
  const isOverdue = new Date(organization.subscriptionDueDate) < new Date() && organization.subscriptionStatus === 'active';

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={() => navigate('/admin/organizations')} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      
      <Button variant={organization.blocked ? "default" : "destructive"} onClick={onToggleBlock}>
        {organization.blocked ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Desbloquear
          </>
        ) : (
          <>
            <X className="h-4 w-4 mr-2" />
            Bloquear
          </>
        )}
      </Button>
    </div>
  );
}
