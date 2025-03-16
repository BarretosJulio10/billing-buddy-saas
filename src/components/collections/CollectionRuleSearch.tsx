
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

interface CollectionRuleSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function CollectionRuleSearch({ searchTerm, onSearchChange }: CollectionRuleSearchProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar modelos..." 
          className="pl-8" 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <TooltipProvider>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="outline" className="h-9 w-9">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-2">
              <h4 className="font-medium leading-none">Modelos de Cobrança</h4>
              <p className="text-sm text-muted-foreground">
                Esta tabela exibe os modelos de cobrança para suas faturas. Cada modelo define:
                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                  <li>Quando enviar lembretes antes do vencimento</li>
                  <li>Se deve enviar cobrança no dia do vencimento</li>
                  <li>Quais dias enviar lembretes após o vencimento</li>
                  <li>Mensagens personalizadas para cada situação</li>
                </ul>
                <br />
                Você pode criar, editar, duplicar ou remover modelos conforme necessário.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  );
}
