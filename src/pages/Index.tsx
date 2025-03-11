
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp
} from "lucide-react";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { InvoiceTimelineChart } from "@/components/dashboard/InvoiceTimelineChart";
import { RecentCustomers } from "@/components/dashboard/RecentCustomers";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { OverviewStats } from "@/components/dashboard/OverviewStats";

const Index = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
      
      {/* Stats Overview */}
      <OverviewStats />
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">Distribuição de Status</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <StatusDistributionChart />
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">Faturas por Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <InvoiceTimelineChart />
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentInvoices />
        <RecentCustomers />
      </div>
    </div>
  );
};

export default Index;
