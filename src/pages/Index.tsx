
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Wifi,
  WifiOff,
  Database,
  CheckCircle,
  XCircle
} from "lucide-react";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { InvoiceTimelineChart } from "@/components/dashboard/InvoiceTimelineChart";
import { RecentCustomers } from "@/components/dashboard/RecentCustomers";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { OverviewStats } from "@/components/dashboard/OverviewStats";

const Index = () => {
  // Mock status - será substituído pela integração com APIs reais
  const whatsappStatus = {
    connected: true,
    lastConnection: "2023-08-15T14:30:00"
  };

  const databaseStatus = {
    connected: true,
    ping: "24ms"
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
      
      {/* Stats Overview */}
      <OverviewStats />
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">Status do WhatsApp</CardTitle>
            {whatsappStatus.connected ? 
              <Wifi className="h-4 w-4 text-success" /> : 
              <WifiOff className="h-4 w-4 text-destructive" />
            }
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {whatsappStatus.connected ? (
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {whatsappStatus.connected ? "Conectado" : "Desconectado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {whatsappStatus.connected 
                      ? `Última verificação: ${new Date(whatsappStatus.lastConnection).toLocaleString('pt-BR')}`
                      : "Verifique as configurações de integração"
                    }
                  </p>
                </div>
              </div>
              <div>
                {whatsappStatus.connected ? (
                  <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    Offline
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium">Status do Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {databaseStatus.connected ? (
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {databaseStatus.connected ? "Conectado" : "Desconectado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {databaseStatus.connected 
                      ? `Ping: ${databaseStatus.ping}`
                      : "Verifique a conexão com o banco de dados"
                    }
                  </p>
                </div>
              </div>
              <div>
                {databaseStatus.connected ? (
                  <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    Offline
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
