
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

type Customer = {
  id: string;
  name: string;
  active: boolean;
  date: Date;
};

export function RecentCustomers() {
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Clientes Recentes</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCustomers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Nenhum cliente recente encontrado
            </div>
          ) : (
            recentCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(customer.date, "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div>
                  {customer.active ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <Check className="h-3 w-3" /> Ativo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <X className="h-3 w-3" /> Inativo
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
