
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Organization } from "@/types/organization";
import { Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface OrganizationInfoProps {
  organization: Organization;
  isOverdue: boolean;
}

export function OrganizationInfo({ organization, isOverdue }: OrganizationInfoProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <CardTitle>{organization.name}</CardTitle>
          </div>
          {organization.blocked ? (
            <Badge variant="destructive">Bloqueado</Badge>
          ) : isOverdue ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Atrasado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Ativo
            </Badge>
          )}
        </div>
        <CardDescription>{organization.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">Cadastrado em</div>
          <div>{new Date(organization.createdAt).toLocaleDateString('pt-BR')}</div>
        </div>
        
        {organization.phone && (
          <div>
            <div className="text-sm font-medium text-muted-foreground">Telefone</div>
            <div>{organization.phone}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
