
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

interface InvoiceSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function InvoiceSearch({ searchTerm, onSearchChange }: InvoiceSearchProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar faturas..." 
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
              <h4 className="font-medium leading-none">Gerenciamento de Faturas</h4>
              <p className="text-sm text-muted-foreground">
                Esta tabela exibe todas as faturas de seus clientes. Você pode:
                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                  <li>Buscar faturas pelo nome do cliente ou descrição</li>
                  <li>Enviar cobranças por WhatsApp ou Telegram</li>
                  <li>Editar os detalhes da fatura</li>
                  <li>Marcar faturas como pagas ou canceladas</li>
                  <li>Mover faturas para a lixeira</li>
                </ul>
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  );
}
