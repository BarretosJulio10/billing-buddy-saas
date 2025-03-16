
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

type StatusCount = {
  name: string;
  value: number;
  color: string;
};

export function StatusDistributionChart() {
  const [data, setData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();
  
  useEffect(() => {
    async function fetchInvoiceStats() {
      if (!organization) return;
      
      try {
        setLoading(true);
        
        // Get paid invoices count
        const { count: paidCount, error: paidError } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('status', 'paid')
          .is('deleted_at', null);
        
        if (paidError) throw paidError;
        
        // Get pending invoices count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('status', 'pending')
          .is('deleted_at', null);
        
        if (pendingError) throw pendingError;
        
        // Get overdue invoices count
        const { count: overdueCount, error: overdueError } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('status', 'overdue')
          .is('deleted_at', null);
        
        if (overdueError) throw overdueError;
        
        // Get canceled invoices count
        const { count: canceledCount, error: canceledError } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization.id)
          .eq('status', 'canceled')
          .is('deleted_at', null);
        
        if (canceledError) throw canceledError;
        
        const chartData: StatusCount[] = [
          { name: "Pagas", value: paidCount || 0, color: "hsl(var(--success))" },
          { name: "Pendentes", value: pendingCount || 0, color: "hsl(var(--primary))" },
          { name: "Atrasadas", value: overdueCount || 0, color: "hsl(var(--destructive))" },
          { name: "Canceladas", value: canceledCount || 0, color: "hsl(var(--muted))" },
        ].filter(item => item.value > 0);
        
        setData(chartData);
      } catch (error) {
        console.error('Error fetching invoice stats:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInvoiceStats();
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} faturas`, '']}
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
