
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isBefore, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

// Types for deleted items
type DeletedItem = {
  id: string;
  name: string;
  type: "customer" | "invoice" | "collection";
  deletedAt: Date;
};

// Temporary mock data until Supabase integration
const mockDeletedItems: DeletedItem[] = [
  { 
    id: "1", 
    name: "João Silva", 
    type: "customer", 
    deletedAt: new Date(2023, 7, 15) 
  },
  { 
    id: "2", 
    name: "Fatura #1234", 
    type: "invoice", 
    deletedAt: new Date(2023, 7, 20) 
  },
  { 
    id: "3", 
    name: "Modelo Premium", 
    type: "collection", 
    deletedAt: new Date(2023, 6, 5) 
  },
  { 
    id: "4", 
    name: "Maria Oliveira", 
    type: "customer", 
    deletedAt: new Date(2023, 7, 25) 
  },
];

const Trash = () => {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>(mockDeletedItems);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const now = new Date();
  const twoMonthsAgo = subMonths(now, 2);

  // Filter items based on search and selected tab
  const filteredItems = (type: string | null) => {
    return deletedItems
      .filter(item => 
        (type ? item.type === type : true) && 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !isBefore(item.deletedAt, twoMonthsAgo)
      )
      .sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
  };

  const handleRestore = (id: string) => {
    // Will be integrated with Supabase to restore the item later
    setDeletedItems(deletedItems.filter(item => item.id !== id));
    toast({
      title: "Item restaurado",
      description: "O item foi restaurado com sucesso.",
    });
  };

  const handlePermanentDelete = (id: string) => {
    // Will be integrated with Supabase to permanently delete the item later
    setDeletedItems(deletedItems.filter(item => item.id !== id));
    toast({
      title: "Item excluído permanentemente",
      description: "O item foi excluído permanentemente.",
      variant: "destructive",
    });
  };

  const getItemTypeName = (type: DeletedItem["type"]) => {
    switch (type) {
      case "customer":
        return "Cliente";
      case "invoice":
        return "Fatura";
      case "collection":
        return "Modelo de Cobrança";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Lixeira</h1>
      <p className="text-muted-foreground">
        Itens excluídos nos últimos 2 meses. Itens mais antigos são excluídos permanentemente.
      </p>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar itens excluídos..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="customer">Clientes</TabsTrigger>
          <TabsTrigger value="invoice">Faturas</TabsTrigger>
          <TabsTrigger value="collection">Modelos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <TrashTable 
            items={filteredItems(null)} 
            onRestore={handleRestore} 
            onDelete={handlePermanentDelete} 
            getItemTypeName={getItemTypeName}
          />
        </TabsContent>
        
        <TabsContent value="customer">
          <TrashTable 
            items={filteredItems("customer")} 
            onRestore={handleRestore} 
            onDelete={handlePermanentDelete} 
            getItemTypeName={getItemTypeName}
          />
        </TabsContent>
        
        <TabsContent value="invoice">
          <TrashTable 
            items={filteredItems("invoice")} 
            onRestore={handleRestore} 
            onDelete={handlePermanentDelete} 
            getItemTypeName={getItemTypeName}
          />
        </TabsContent>
        
        <TabsContent value="collection">
          <TrashTable 
            items={filteredItems("collection")} 
            onRestore={handleRestore} 
            onDelete={handlePermanentDelete} 
            getItemTypeName={getItemTypeName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TrashTableProps {
  items: DeletedItem[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  getItemTypeName: (type: DeletedItem["type"]) => string;
}

const TrashTable = ({ items, onRestore, onDelete, getItemTypeName }: TrashTableProps) => {
  return (
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
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                Nenhum item encontrado
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
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
                      size="icon"
                      onClick={() => onRestore(item.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => onDelete(item.id)}
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
  );
};

export default Trash;
