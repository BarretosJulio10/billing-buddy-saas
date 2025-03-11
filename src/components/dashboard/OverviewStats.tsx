
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, AlertCircle, DollarSign, ArrowUp, ArrowDown, Activity } from "lucide-react";

// Mock data - will be replaced with actual API data
const stats = [
  {
    title: "Total de Clientes",
    value: "145",
    icon: Users,
    change: "+12% em 30 dias",
    positive: true
  },
  {
    title: "Faturas Abertas",
    value: "38",
    icon: FileText,
    change: "+5% em 30 dias",
    positive: false
  },
  {
    title: "Faturas Atrasadas",
    value: "7",
    icon: AlertCircle,
    change: "-2% em 30 dias",
    positive: true
  },
  {
    title: "Valor Recebido",
    value: "R$ 12.450",
    icon: DollarSign,
    change: "+18% em 30 dias",
    positive: true
  },
  {
    title: "Taxa de Conversão",
    value: "94%",
    icon: ArrowUp,
    change: "+3% em 30 dias",
    positive: true
  },
  {
    title: "Mensagens Enviadas",
    value: "1.256",
    icon: Activity,
    change: "+22% em 30 dias",
    positive: true
  }
];

export function OverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <div className="rounded-full p-2 bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className={`text-xs mt-3 ${stat.positive ? 'text-success' : 'text-destructive'}`}>
              <span className="flex items-center">
                {stat.positive ? (
                  <ArrowUp className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3" />
                )}
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
