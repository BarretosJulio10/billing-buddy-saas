
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  Bell, 
  DollarSign, 
  BarChart3, 
  TrendingUp, 
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
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
      
      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/customers" className="block">
          <Card className="p-6 hover:shadow-lg transition-shadow hover:border-primary/50">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <h2 className="font-semibold">Clientes</h2>
                <p className="text-sm text-muted-foreground">Gerenciar clientes</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/invoices" className="block">
          <Card className="p-6 hover:shadow-lg transition-shadow hover:border-primary/50">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h2 className="font-semibold">Faturas</h2>
                <p className="text-sm text-muted-foreground">Controle de faturas</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link to="/collections" className="block">
          <Card className="p-6 hover:shadow-lg transition-shadow hover:border-primary/50">
            <div className="flex items-center gap-4">
              <Bell className="w-8 h-8 text-primary" />
              <div>
                <h2 className="font-semibold">Cobranças</h2>
                <p className="text-sm text-muted-foreground">Régua de cobrança</p>
              </div>
            </div>
          </Card>
        </Link>
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
