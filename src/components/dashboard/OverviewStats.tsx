
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  FileText, 
  AlertCircle, 
  DollarSign, 
  ArrowUp, 
  ArrowDown, 
  MessageCircle 
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";

type StatsItem = {
  title: string;
  value: string;
  icon: any;
  change: string;
  positive: boolean;
  description: string;
  color: string;
};

export function OverviewStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalCustomers: number;
    openInvoices: number;
    overdueInvoices: number;
    totalReceived: number;
    conversionRate: number;
    messagesSent: number;
    customerChange: number;
    invoiceChange: number;
    overdueChange: number;
    receivedChange: number;
    conversionChange: number;
    messagesChange: number;
  }>({
    totalCustomers: 0,
    openInvoices: 0,
    overdueInvoices: 0,
    totalReceived: 0,
    conversionRate: 0,
    messagesSent: 0,
    customerChange: 0,
    invoiceChange: 0,
    overdueChange: 0,
    receivedChange: 0,
    conversionChange: 0,
    messagesChange: 0
  });
  const { organization } = useOrganization();

  useEffect(() => {
    async function fetchStats() {
      if (!organization) return;
      
      try {
        setLoading(true);
        
        // Get total active customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, created_at')
          .eq('organization_id', organization.id)
          .eq('is_active', true)
          .is('deleted_at', null);
        
        if (customersError) throw customersError;
        
        // Count customers created in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCustomers = customersData?.filter(
          customer => new Date(customer.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Get open invoices
        const { data: openInvoicesData, error: openInvoicesError } = await supabase
          .from('invoices')
          .select('id, created_at')
          .eq('organization_id', organization.id)
          .eq('status', 'pending')
          .is('deleted_at', null);
        
        if (openInvoicesError) throw openInvoicesError;
        
        // Count invoices created in the last 30 days
        const recentInvoices = openInvoicesData?.filter(
          invoice => new Date(invoice.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Get overdue invoices
        const { data: overdueInvoicesData, error: overdueInvoicesError } = await supabase
          .from('invoices')
          .select('id, created_at')
          .eq('organization_id', organization.id)
          .eq('status', 'overdue')
          .is('deleted_at', null);
        
        if (overdueInvoicesError) throw overdueInvoicesError;
        
        // Count overdue invoices in the last 30 days
        const recentOverdueInvoices = overdueInvoicesData?.filter(
          invoice => new Date(invoice.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Get paid invoices
        const { data: paidInvoicesData, error: paidInvoicesError } = await supabase
          .from('invoices')
          .select('id, amount, paid_at')
          .eq('organization_id', organization.id)
          .eq('status', 'paid')
          .is('deleted_at', null);
        
        if (paidInvoicesError) throw paidInvoicesError;
        
        // Calculate total received amount
        const totalReceived = paidInvoicesData?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;
        
        // Count paid invoices in the last 30 days
        const recentPaidInvoices = paidInvoicesData?.filter(
          invoice => invoice.paid_at && new Date(invoice.paid_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Calculate conversion rate (paid / total)
        const totalInvoices = (openInvoicesData?.length || 0) + (overdueInvoicesData?.length || 0) + (paidInvoicesData?.length || 0);
        const conversionRate = totalInvoices > 0 ? (paidInvoicesData?.length || 0) / totalInvoices * 100 : 0;
        
        // Get messages sent
        const { data: messagesData, error: messagesError } = await supabase
          .from('message_history')
          .select('id, created_at')
          .eq('organization_id', organization.id)
          .eq('status', 'sent');
        
        if (messagesError) throw messagesError;
        
        // Count messages sent in the last 30 days
        const recentMessages = messagesData?.filter(
          message => new Date(message.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Calculate change percentages (mock data for now as we need historical data)
        // In a real app, we'd compare with previous period
        const customerChange = customersData?.length ? (recentCustomers / customersData.length) * 100 : 0;
        const invoiceChange = openInvoicesData?.length ? (recentInvoices / openInvoicesData.length) * 100 : 0;
        const overdueChange = overdueInvoicesData?.length ? (recentOverdueInvoices / overdueInvoicesData.length) * 100 : 0;
        const receivedChange = paidInvoicesData?.length ? (recentPaidInvoices / paidInvoicesData.length) * 100 : 0;
        const conversionChange = 0; // Would need historical data
        const messagesChange = messagesData?.length ? (recentMessages / messagesData.length) * 100 : 0;
        
        setStats({
          totalCustomers: customersData?.length || 0,
          openInvoices: openInvoicesData?.length || 0,
          overdueInvoices: overdueInvoicesData?.length || 0,
          totalReceived: totalReceived || 0,
          conversionRate: conversionRate || 0,
          messagesSent: messagesData?.length || 0,
          customerChange: Math.round(customerChange),
          invoiceChange: Math.round(invoiceChange),
          overdueChange: Math.round(overdueChange * -1), // negative change is positive for overdue
          receivedChange: Math.round(receivedChange),
          conversionChange: Math.round(conversionChange),
          messagesChange: Math.round(messagesChange)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [organization]);

  // Format items for display
  const statsItems: StatsItem[] = [
    {
      title: "Total de Clientes",
      value: stats.totalCustomers.toString(),
      icon: Users,
      change: `${stats.customerChange}% em 30 dias`,
      positive: stats.customerChange >= 0,
      description: "Total de clientes ativos no sistema",
      color: "blue-500"
    },
    {
      title: "Faturas Abertas",
      value: stats.openInvoices.toString(),
      icon: FileText,
      change: `${stats.invoiceChange}% em 30 dias`,
      positive: stats.invoiceChange < 0, // Fewer open invoices is positive
      description: "Faturas pendentes de pagamento",
      color: "indigo-500"
    },
    {
      title: "Faturas Atrasadas",
      value: stats.overdueInvoices.toString(),
      icon: AlertCircle,
      change: `${stats.overdueChange}% em 30 dias`,
      positive: stats.overdueChange >= 0, // Fewer overdue invoices is positive
      description: "Faturas com pagamento em atraso",
      color: "amber-500"
    },
    {
      title: "Valor Recebido",
      value: `R$ ${stats.totalReceived.toFixed(2)}`,
      icon: DollarSign,
      change: `${stats.receivedChange}% em 30 dias`,
      positive: stats.receivedChange >= 0,
      description: "Total recebido de faturas pagas",
      color: "green-500"
    },
    {
      title: "Taxa de Conversão",
      value: `${Math.round(stats.conversionRate)}%`,
      icon: ArrowUp,
      change: `${stats.conversionChange}% em 30 dias`,
      positive: stats.conversionChange >= 0,
      description: "Porcentagem de faturas pagas vs total",
      color: "purple-500"
    },
    {
      title: "Mensagens Enviadas",
      value: stats.messagesSent.toString(),
      icon: MessageCircle,
      change: `${stats.messagesChange}% em 30 dias`,
      positive: stats.messagesChange >= 0,
      description: "Total de mensagens enviadas aos clientes",
      color: "cyan-500"
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {loading ? (
        // Skeleton loading states
        Array(6).fill(null).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))
      ) : (
        statsItems.map((stat, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <div className={`rounded-full p-1.5 bg-${stat.color}/10`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className={`text-xs flex items-center ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.positive ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
