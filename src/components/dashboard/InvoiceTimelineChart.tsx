
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - this will be replaced with actual API data in production
const initialData = [
  { name: "Jan", total: 12450 },
  { name: "Fev", total: 15250 },
  { name: "Mar", total: 14830 },
  { name: "Abr", total: 16590 },
  { name: "Mai", total: 18340 },
  { name: "Jun", total: 17580 },
];

export function InvoiceTimelineChart() {
  const [data, setData] = useState<{ name: string; total: number }[]>([]);
  
  // Simulating data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(initialData);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px]">
        <div className="text-muted-foreground">Carregando dados...</div>
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
