
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock data - will be replaced with API data
const recentInvoices = [
  {
    id: "INV-001",
    customerName: "João Silva",
    amount: 199.90,
    status: "paid",
    date: new Date(2023, 6, 25)
  },
  {
    id: "INV-002",
    customerName: "Maria Oliveira",
    amount: 129.90,
    status: "pending",
    date: new Date(2023, 6, 28)
  },
  {
    id: "INV-003",
    customerName: "Pedro Santos",
    amount: 249.90,
    status: "overdue",
    date: new Date(2023, 6, 22)
  },
  {
    id: "INV-004",
    customerName: "Ana Ferreira",
    amount: 79.90,
    status: "paid",
    date: new Date(2023, 6, 26)
  }
];

export function RecentInvoices() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Pago</Badge>;
      case "pending":
        return <Badge variant="default">Pendente</Badge>;
      case "overdue":
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Faturas Recentes</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentInvoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{invoice.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(invoice.date, "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(invoice.status)}
                <span className="text-sm font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(invoice.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
