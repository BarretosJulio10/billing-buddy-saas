
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Organization } from "@/types/organization";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

interface OrganizationActionsProps {
  organization: Organization;
  onToggleBlock: () => void;
}

export function OrganizationActions({ organization, onToggleBlock }: OrganizationActionsProps) {
  const navigate = useNavigate();

  const handleImpersonate = () => {
    navigate(`/admin/impersonate/${organization.id}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações e Gerenciamento</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="actions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="actions">Ações</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>
          <TabsContent value="actions" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button className="w-full" onClick={() => window.open(`mailto:${organization.email}`)}>
                Enviar Email
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2" 
                onClick={handleImpersonate}
              >
                <LogIn className="h-4 w-4" />
                Acessar como Empresa
              </Button>
              
              <Button variant={organization.blocked ? "default" : "destructive"} className="w-full" onClick={onToggleBlock}>
                {organization.blocked ? "Desbloquear Empresa" : "Bloquear Empresa"}
              </Button>
              
              <Button variant="outline" className="w-full">
                Gerar Nova Fatura
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="activity" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="text-sm">
                  <span className="font-medium">Empresa criada</span> - {format(new Date(organization.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
              
              {organization.lastPaymentDate && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="text-sm">
                    <span className="font-medium">Último pagamento</span> - {format(new Date(organization.lastPaymentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <div className="text-sm">
                  <span className="font-medium">Próxima cobrança</span> - {format(new Date(organization.subscriptionDueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
