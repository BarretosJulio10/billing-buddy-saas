
import { Users, CreditCard, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
        <CardTitle>Visão Geral</CardTitle>
        <CardDescription>Estatísticas e uso do sistema por esta empresa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-sm font-medium text-blue-700">Clientes</div>
            </div>
            <div className="text-2xl font-bold">{stats.customers}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 flex flex-col">
            <div className="flex items-center mb-2">
              <CreditCard className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-sm font-medium text-green-700">Faturas</div>
            </div>
            <div className="text-2xl font-bold">{stats.invoices}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 flex flex-col">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-purple-500 mr-2" />
              <div className="text-sm font-medium text-purple-700">Cobranças</div>
            </div>
            <div className="text-2xl font-bold">{stats.collections}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
