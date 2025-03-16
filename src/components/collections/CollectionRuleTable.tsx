
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { CollectionRule } from "./types";
import { CollectionRuleSearch } from "./CollectionRuleSearch";
import { EmptyCollectionRuleTable } from "./EmptyCollectionRuleTable";
import { CollectionRuleTableRow } from "./CollectionRuleTableRow";

export function CollectionRuleTable() {
  const [collectionRules, setCollectionRules] = useState<(CollectionRule & { overdueDaysAfter: number[] })[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

    // Check if we're updating an existing rule
    const existingRule = collectionRules.find(rule => rule.id === updatedRule.id);
    
    if (existingRule) {
      // Update existing rule
      setCollectionRules(
        collectionRules.map((rule) =>
          rule.id === existingRule.id
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
  };

  return (
    <div className="space-y-4">
      <CollectionRuleSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

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
              <EmptyCollectionRuleTable />
            ) : (
              filteredRules.map((rule) => (
                <CollectionRuleTableRow
                  key={rule.id}
                  rule={rule}
                  onStatusChange={handleStatusChange}
                  onEdit={handleSaveRule}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
