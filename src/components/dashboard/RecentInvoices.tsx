
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";

type Invoice = {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  date: Date;
};

export function RecentInvoices() {
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();

  useEffect(() => {
    async function fetchRecentInvoices() {
      if (!organization) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            id,
            amount,
            status,
            created_at,
            customers(name)
          `)
          .eq('organization_id', organization.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching recent invoices:', error);
          return;
        }

        const formattedInvoices = data.map(invoice => ({
          id: invoice.id,
          customerName: invoice.customers?.name || 'Cliente',
          amount: invoice.amount,
          status: invoice.status || 'pending',
          date: new Date(invoice.created_at),
        }));

        setRecentInvoices(formattedInvoices);
      } catch (error) {
        console.error('Error in fetchRecentInvoices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentInvoices();
  }, [organization]);

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
          {loading ? (
            // Skeleton loading state
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))
          ) : recentInvoices.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Nenhuma fatura recente encontrada
            </div>
          ) : (
            recentInvoices.map((invoice) => (
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
