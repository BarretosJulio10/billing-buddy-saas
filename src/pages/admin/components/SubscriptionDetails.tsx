
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Organization } from "@/types/organization";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionForm } from "./SubscriptionForm";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface SubscriptionDetailsProps {
  organization: Organization;
  isOverdue: boolean;
  onUpdateSubscription: (data: any) => Promise<void>;
}

export function SubscriptionDetails({ organization, isOverdue, onUpdateSubscription }: SubscriptionDetailsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assinatura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-muted-foreground">Status</div>
          <Badge variant={organization.blocked ? "destructive" : isOverdue ? "outline" : "outline"} 
                 className={!organization.blocked && !isOverdue ? "bg-green-50 text-green-700 border-green-200" : 
                           isOverdue ? "bg-amber-50 text-amber-700 border-amber-200" : ""}>
            {organization.blocked 
              ? "Bloqueado" 
              : isOverdue 
                ? "Atrasado" 
                : "Ativo"}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-muted-foreground">Próximo vencimento</div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{format(new Date(organization.subscriptionDueDate), "dd/MM/yyyy")}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-muted-foreground">Valor mensal</div>
          <div className="font-medium">R$ {organization.subscriptionAmount.toFixed(2)}</div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-muted-foreground">Gateway</div>
          <Badge variant="outline">
            {organization.gateway === "mercadopago" ? "Mercado Pago" : "Asaas"}
          </Badge>
        </div>
        
        {organization.lastPaymentDate && (
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-muted-foreground">Último pagamento</div>
            <div>{format(new Date(organization.lastPaymentDate), "dd/MM/yyyy")}</div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Atualizar Assinatura</Button>
          </DialogTrigger>
          <SubscriptionForm 
            organization={organization} 
            onSubmit={async (data) => {
              await onUpdateSubscription(data);
              setDialogOpen(false);
            }}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
}
