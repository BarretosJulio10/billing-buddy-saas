
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
import { Search, Trash2, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Types for deleted items
type ItemType = "customer" | "invoice" | "collection_rule";

interface DeletedItem {
  id: string;
  name: string;
  type: ItemType;
  deletedAt: Date;
}

// Generate mock deleted items
const generateMockDeletedItems = (): DeletedItem[] => {
  const now = new Date();
  return [
    {
      id: "1",
      name: "João Silva",
      type: "customer",
      deletedAt: subMonths(now, 1),
    },
    {
      id: "2",
      name: "Mensalidade Agosto 2023",
      type: "invoice",
      deletedAt: subMonths(now, 0.5),
    },
    {
      id: "3",
      name: "Modelo Premium",
      type: "collection_rule",
      deletedAt: subMonths(now, 1.2),
    },
    {
      id: "4",
      name: "Maria Oliveira",
      type: "customer",
      deletedAt: subMonths(now, 0.2),
    },
    {
      id: "5",
      name: "Modelo Educacional",
      type: "collection_rule",
      deletedAt: subMonths(now, 1.8),
    },
  ];
};

export function TrashTable() {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>(generateMockDeletedItems());
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const filteredItems = deletedItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    
    // Only show items deleted within the last 2 months
    const twoMonthsAgo = subMonths(new Date(), 2);
    const isWithinTwoMonths = item.deletedAt >= twoMonthsAgo;
    
    return matchesSearch && matchesType && isWithinTwoMonths;
  });

  const handleRestore = (id: string) => {
    const itemToRestore = deletedItems.find(item => item.id === id);
    if (itemToRestore) {
      // In a real app, this would restore the item in the database
      setDeletedItems(deletedItems.filter(item => item.id !== id));
      
      toast({
        title: "Item restaurado",
        description: `"${itemToRestore.name}" foi restaurado com sucesso.`,
      });
    }
  };

  const handlePermanentDelete = (id: string) => {
    const itemToDelete = deletedItems.find(item => item.id === id);
    if (itemToDelete) {
      // In a real app, this would permanently delete the item from the database
      setDeletedItems(deletedItems.filter(item => item.id !== id));
      
      toast({
        title: "Item excluído permanentemente",
        description: `"${itemToDelete.name}" foi excluído permanentemente.`,
        variant: "destructive",
      });
    }
  };

  const getItemTypeName = (type: ItemType): string => {
    switch (type) {
      case "customer":
        return "Cliente";
      case "invoice":
        return "Fatura";
      case "collection_rule":
        return "Modelo de Cobrança";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar itens excluídos..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[180px]">
          <Select 
            value={typeFilter} 
            onValueChange={setTypeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="customer">Clientes</SelectItem>
              <SelectItem value="invoice">Faturas</SelectItem>
              <SelectItem value="collection_rule">Modelos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Excluído em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Nenhum item encontrado na lixeira
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getItemTypeName(item.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(item.deletedAt, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestore(item.id)}
                      >
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Restaurar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o item "{item.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handlePermanentDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir permanentemente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Nota: Os itens são automaticamente excluídos da lixeira após 2 meses.
      </div>
    </div>
  );
}
