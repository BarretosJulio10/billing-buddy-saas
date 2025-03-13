
import { Organization } from "@/types/organization";
import { format } from "date-fns";
import { Building, Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrganizationInfoProps {
  organization: Organization;
  isOverdue: boolean;
}

export function OrganizationInfo({ organization, isOverdue }: OrganizationInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detalhes da Empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Building className="h-4 w-4 mt-1 text-muted-foreground" />
          <div className="space-y-1">
            <div className="font-medium">{organization.name}</div>
            <div className="text-sm text-muted-foreground">
              {organization.blocked ? (
                <Badge variant="destructive">Bloqueado</Badge>
              ) : isOverdue ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Pagamento atrasado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Ativo
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="space-y-1">
            <div className="font-medium">Email</div>
            <div className="text-sm">{organization.email}</div>
          </div>
        </div>
        
        {organization.phone && (
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="space-y-1">
              <div className="font-medium">Telefone</div>
              <div className="text-sm">{organization.phone}</div>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <div className="space-y-1">
            <div className="font-medium">Cadastrado em</div>
            <div className="text-sm">{format(new Date(organization.createdAt), "dd/MM/yyyy")}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
