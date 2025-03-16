
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
import { useState, useEffect } from "react";

type StatItem = {
  title: string;
  value: string;
  icon: any;
  change: string;
  positive: boolean;
  description: string;
};

export function OverviewStats() {
  const [stats, setStats] = useState<StatItem[]>([]);

  // This will be replaced with an actual API call in the future
  useEffect(() => {
    // Empty stats for now
  }, []);

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
        
        {stats.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            Nenhuma estatística disponível
          </div>
        ) : (
          stats.map((stat, index) => (
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
          ))
        )}
      </TooltipProvider>
    </div>
  );
}
