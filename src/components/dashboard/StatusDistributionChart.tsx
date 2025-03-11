
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Mock data - this will be replaced with actual API data in production
const initialData = [
  { name: "Pagas", value: 48, color: "hsl(var(--success))" },
  { name: "Pendentes", value: 32, color: "hsl(var(--primary))" },
  { name: "Atrasadas", value: 14, color: "hsl(var(--destructive))" },
  { name: "Canceladas", value: 6, color: "hsl(var(--muted))" },
];

export function StatusDistributionChart() {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([]);
  
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
