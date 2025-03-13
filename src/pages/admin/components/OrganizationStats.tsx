
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar } from "lucide-react";

interface OrganizationStatsProps {
  stats: {
    customers: number;
    invoices: number;
    collections: number;
  };
}

export function OrganizationStats({ stats }: OrganizationStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estatísticas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Clientes</div>
              <div className="text-xl font-semibold">{stats.customers}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Faturas</div>
              <div className="text-xl font-semibold">{stats.invoices}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Regras de Cobrança</div>
              <div className="text-xl font-semibold">{stats.collections}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
