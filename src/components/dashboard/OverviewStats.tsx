
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
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                <span className="text-xl font-bold">{stat.value}</span>
              </div>
              <div className="rounded-full p-1.5 bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className={`text-xs mt-1 ${stat.positive ? 'text-success' : 'text-destructive'}`}>
              <span className="flex items-center">
                {stat.positive ? (
                  <ArrowUp className="mr-1 h-2 w-2" />
                ) : (
                  <ArrowDown className="mr-1 h-2 w-2" />
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
