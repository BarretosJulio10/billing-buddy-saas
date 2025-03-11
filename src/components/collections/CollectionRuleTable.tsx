
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
import { Search, Edit, Trash2, CopyIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CollectionRuleForm, CollectionRule } from "./CollectionRuleForm";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

// Temporary mock data until Supabase integration
const mockCollectionRules: (CollectionRule & { overdueDaysAfter: number[] })[] = [
  { 
    id: "1", 
    name: "Modelo Padrão", 
    isActive: true,
    reminderDaysBefore: 3,
    sendOnDueDate: true,
    overdueDaysAfter: [1, 3, 5, 10],
    reminderTemplate: "Olá {cliente}, lembre-se que sua fatura de {valor} vence em {dias_para_vencer} dias.",
    dueDateTemplate: "Olá {cliente}, sua fatura de {valor} vence hoje. Link de pagamento: {link}",
    overdueTemplate: "Olá {cliente}, sua fatura de {valor} está atrasada há {dias_atraso} dias. Link de pagamento: {link}",
    confirmationTemplate: "Olá {cliente}, confirmamos o recebimento do pagamento da sua fatura de {valor}. Obrigado!",
  },
  { 
    id: "2", 
    name: "Modelo Premium", 
    isActive: true,
    reminderDaysBefore: 5,
    sendOnDueDate: true,
    overdueDaysAfter: [2, 5, 10, 15],
    reminderTemplate: "Prezado {cliente}, sua fatura de {valor} vencerá em {dias_para_vencer} dias. Por favor, prepare-se para o pagamento.",
    dueDateTemplate: "Prezado {cliente}, sua fatura de {valor} vence hoje. Clique aqui para pagar: {link}",
    overdueTemplate: "Prezado {cliente}, sua fatura de {valor} está atrasada há {dias_atraso} dias. Clique aqui para regularizar: {link}",
    confirmationTemplate: "Prezado {cliente}, agradecemos pelo pagamento da sua fatura de {valor}. Continue aproveitando nossos serviços!",
  },
];

export function CollectionRuleTable() {
  const [collectionRules, setCollectionRules] = useState(mockCollectionRules);
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
                    <Switch 
                      checked={rule.isActive} 
                      onCheckedChange={() => handleStatusChange(rule.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setRuleToEdit(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
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
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDuplicate(rule.id)}
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
