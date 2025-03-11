
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, AlertCircle, DollarSign, ArrowUp, ArrowDown, Activity, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Mock data - will be replaced with actual API data
const stats = [
  {
    title: "Total de Clientes",
    value: "145",
    icon: Users,
    change: "+12% em 30 dias",
    positive: true,
    description: "Número total de clientes cadastrados no sistema, independente do status."
  },
  {
    title: "Faturas Abertas",
    value: "38",
    icon: FileText,
    change: "+5% em 30 dias",
    positive: false,
    description: "Faturas pendentes de pagamento que ainda não estão vencidas."
  },
  {
    title: "Faturas Atrasadas",
    value: "7",
    icon: AlertCircle,
    change: "-2% em 30 dias",
    positive: true,
    description: "Faturas vencidas que ainda não foram pagas pelos clientes."
  },
  {
    title: "Valor Recebido",
    value: "R$ 12.450",
    icon: DollarSign,
    change: "+18% em 30 dias",
    positive: true,
    description: "Valor total recebido através de pagamentos nos últimos 30 dias."
  },
  {
    title: "Taxa de Conversão",
    value: "94%",
    icon: ArrowUp,
    change: "+3% em 30 dias",
    positive: true,
    description: "Porcentagem de faturas que foram pagas em relação ao total emitido."
  },
  {
    title: "Mensagens Enviadas",
    value: "1.256",
    icon: Activity,
    change: "+22% em 30 dias",
    positive: true,
    description: "Total de mensagens de lembrete e cobrança enviadas nos últimos 30 dias."
  }
];

export function OverviewStats() {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <TooltipProvider>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="outline" className="absolute right-3 top-3 h-8 w-8">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-2">
              <h4 className="font-medium leading-none">Estatísticas do Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Estas estatísticas mostram o desempenho geral do seu sistema de cobrança nos últimos 30 dias.
                Passe o mouse sobre cada card para ver detalhes específicos.
              </p>
            </div>
          </PopoverContent>
        </Popover>
        
        {stats.map((stat, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Card className="shadow-sm">
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
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{stat.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
