
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { format, subMonths, eachMonthOfInterval, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type ChartData = { name: string; total: number }[];

export function InvoiceTimelineChart() {
  const [data, setData] = useState<ChartData>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();
  
  useEffect(() => {
    async function fetchInvoiceTimeline() {
      if (!organization) return;
      
      try {
        setLoading(true);
        
        // Get paid invoices for the last 6 months
        const endDate = new Date();
        const startDate = subMonths(endDate, 5); // Last 6 months including current
        
        const { data: invoices, error } = await supabase
          .from('invoices')
          .select('amount, paid_at')
          .eq('organization_id', organization.id)
          .eq('status', 'paid')
          .is('deleted_at', null)
          .gte('paid_at', startDate.toISOString())
          .lte('paid_at', endDate.toISOString())
          .order('paid_at', { ascending: true });
        
        if (error) throw error;
        
        // Create an array of all months in the interval
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        
        // Initialize data with 0 for each month
        const initialData = months.map(month => ({
          name: format(month, 'MMM', { locale: ptBR }),
          month: month,
          total: 0
        }));
        
        // Aggregate invoice amounts by month
        if (invoices && invoices.length > 0) {
          invoices.forEach(invoice => {
            if (invoice.paid_at && invoice.amount) {
              const paidDate = parseISO(invoice.paid_at);
              const monthKey = startOfMonth(paidDate).getTime();
              
              const monthIndex = initialData.findIndex(
                item => item.month.getTime() === monthKey
              );
              
              if (monthIndex !== -1) {
                initialData[monthIndex].total += Number(invoice.amount);
              }
            }
          });
        }
        
        // Remove the month object before setting to state
        setData(initialData.map(({ name, total }) => ({ name, total })));
      } catch (error) {
        console.error('Error fetching invoice timeline:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInvoiceTimeline();
  }, [organization]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[220px]">
        <div className="text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px]">
        <div className="text-muted-foreground">Sem dados disponíveis</div>
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `R$${value / 1000}k`}
          />
          <Tooltip 
            formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Faturamento']}
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
