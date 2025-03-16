
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash2, CopyIcon, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CollectionRuleForm, CollectionRule } from "./CollectionRuleForm";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function CollectionRuleTable() {
  const [collectionRules, setCollectionRules] = useState<(CollectionRule & { overdueDaysAfter: number[] })[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ruleToEdit, setRuleToEdit] = useState<CollectionRule | null>(null);
  const { toast } = useToast();

  const filteredRules = collectionRules.filter((rule) =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: string) => {
    setCollectionRules(
      collectionRules.map((rule) =>
        rule.id === id
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
    toast({
      title: "Status atualizado",
      description: "O status do modelo foi atualizado com sucesso.",
    });
  };

  const handleDelete = (id: string) => {
    // In the future, this will mark as deleted in the database
    setCollectionRules(collectionRules.filter((rule) => rule.id !== id));
    toast({
      title: "Modelo removido",
      description: "O modelo foi movido para a lixeira.",
      variant: "destructive",
    });
  };

  const handleDuplicate = (id: string) => {
    const ruleToDuplicate = collectionRules.find((rule) => rule.id === id);
    
    if (ruleToDuplicate) {
      const newRule = {
        ...ruleToDuplicate,
        id: Date.now().toString(),
        name: `${ruleToDuplicate.name} (Cópia)`,
      };
      
      setCollectionRules([...collectionRules, newRule]);
      
      toast({
        title: "Modelo duplicado",
        description: "O modelo foi duplicado com sucesso.",
      });
    }
  };

  const handleSaveRule = (updatedRule: any) => {
    const parsedOverdueDays = updatedRule.overdueDaysAfter.split(',')
      .map((day: string) => parseInt(day.trim()))
      .filter((day: number) => !isNaN(day));

    if (ruleToEdit) {
      // Update existing rule
      setCollectionRules(
        collectionRules.map((rule) =>
          rule.id === ruleToEdit.id
            ? { 
                ...rule, 
                ...updatedRule,
                overdueDaysAfter: parsedOverdueDays,
              }
            : rule
        )
      );
      toast({
        title: "Modelo atualizado",
        description: "O modelo de cobrança foi atualizado com sucesso.",
      });
    } else {
      // Add new rule
      const newRule = {
        ...updatedRule,
        id: Date.now().toString(),
        overdueDaysAfter: parsedOverdueDays,
      };
      setCollectionRules([...collectionRules, newRule]);
      toast({
        title: "Modelo adicionado",
        description: "O novo modelo de cobrança foi adicionado com sucesso.",
      });
    }
    setRuleToEdit(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar modelos..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Lembrete (dias)</TableHead>
              <TableHead>Cobranças após vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum modelo de cobrança encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.reminderDaysBefore} dias antes</TableCell>
                  <TableCell>{rule.overdueDaysAfter.join(', ')} dias depois</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Switch 
                            checked={rule.isActive} 
                            onCheckedChange={() => handleStatusChange(rule.id)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {rule.isActive ? "Desativar modelo" : "Ativar modelo"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Sheet>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <SheetTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => setRuleToEdit(rule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </SheetTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Editar modelo</TooltipContent>
                          </Tooltip>
                          <SheetContent className="w-full sm:max-w-[540px]">
                            <SheetHeader>
                              <SheetTitle>Editar Modelo de Cobrança</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                              {ruleToEdit && (
                                <CollectionRuleForm 
                                  initialData={{
                                    name: ruleToEdit.name,
                                    isActive: ruleToEdit.isActive,
                                    reminderDaysBefore: ruleToEdit.reminderDaysBefore,
                                    sendOnDueDate: ruleToEdit.sendOnDueDate,
                                    overdueDaysAfter: ruleToEdit.overdueDaysAfter.join(', '),
                                    reminderTemplate: ruleToEdit.reminderTemplate,
                                    dueDateTemplate: ruleToEdit.dueDateTemplate,
                                    overdueTemplate: ruleToEdit.overdueTemplate,
                                    confirmationTemplate: ruleToEdit.confirmationTemplate,
                                  }}
                                  onSubmit={handleSaveRule}
                                  onCancel={() => setRuleToEdit(null)}
                                />
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDuplicate(rule.id)}
                            >
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicar modelo</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDelete(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remover modelo</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
