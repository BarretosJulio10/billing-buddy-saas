
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data - will be replaced with API data
const recentCustomers = [
  {
    id: "CUS-001",
    name: "Lucas Mendes",
    active: true,
    date: new Date(2023, 6, 15)
  },
  {
    id: "CUS-002",
    name: "Fernanda Costa",
    active: true,
    date: new Date(2023, 6, 18)
  },
  {
    id: "CUS-003",
    name: "Roberto Almeida",
    active: false,
    date: new Date(2023, 6, 10)
  },
  {
    id: "CUS-004",
    name: "Carolina Santos",
    active: true,
    date: new Date(2023, 6, 20)
  }
];

export function RecentCustomers() {
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Clientes Recentes</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCustomers.map((customer) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
