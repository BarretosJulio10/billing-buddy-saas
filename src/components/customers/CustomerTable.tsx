
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
import { Search, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CustomerForm } from "./CustomerForm";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

// Temporary mock data until Supabase integration
const mockCustomers = [
  { 
    id: "1", 
    name: "João Silva", 
    email: "joao@exemplo.com", 
    phone: "(11) 98765-4321", 
    document: "123.456.789-00",
    address: "Rua das Flores, 123",
    isActive: true 
  },
  { 
    id: "2", 
    name: "Maria Oliveira", 
    email: "maria@exemplo.com", 
    phone: "(11) 91234-5678", 
    document: "987.654.321-00",
    address: "Av. Paulista, 1000",
    isActive: false 
  },
  { 
    id: "3", 
    name: "Pedro Santos", 
    email: "pedro@exemplo.com", 
    phone: "(11) 99876-5432", 
    document: "456.789.123-00",
    address: "Rua Augusta, 500",
    isActive: true 
  },
];

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  isActive: boolean;
};

export function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const { toast } = useToast();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.document.includes(searchTerm)
  );

  const handleStatusChange = (id: string) => {
    setCustomers(
      customers.map((customer) =>
        customer.id === id
          ? { ...customer, isActive: !customer.isActive }
          : customer
      )
    );
    toast({
      title: "Status atualizado",
      description: "O status do cliente foi atualizado com sucesso.",
    });
  };

  const handleDelete = (id: string) => {
    // In the future, this will mark as deleted in the database
    setCustomers(customers.filter((customer) => customer.id !== id));
    toast({
      title: "Cliente removido",
      description: "O cliente foi movido para a lixeira.",
      variant: "destructive",
    });
  };

  const handleSaveCustomer = (updatedCustomer: Omit<Customer, "id">) => {
    if (customerToEdit) {
      // Update existing customer
      setCustomers(
        customers.map((customer) =>
          customer.id === customerToEdit.id
            ? { ...updatedCustomer, id: customerToEdit.id }
            : customer
        )
      );
      toast({
        title: "Cliente atualizado",
        description: "Os dados do cliente foram atualizados com sucesso.",
      });
    } else {
      // Add new customer
      const newCustomer = {
        ...updatedCustomer,
        id: Date.now().toString(), // Temporary, will be replaced with UUID from Supabase
      };
      setCustomers([...customers, newCustomer]);
      toast({
        title: "Cliente adicionado",
        description: "O novo cliente foi adicionado com sucesso.",
      });
    }
    setCustomerToEdit(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar clientes..." 
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
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.document}</TableCell>
                  <TableCell>
                    <Badge variant={customer.isActive ? "success" : "destructive"}>
                      {customer.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setCustomerToEdit(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-[540px]">
                          <SheetHeader>
                            <SheetTitle>Editar Cliente</SheetTitle>
                          </SheetHeader>
                          <div className="mt-6">
                            <CustomerForm 
                              initialData={customerToEdit!} 
                              onSubmit={handleSaveCustomer}
                              onCancel={() => setCustomerToEdit(null)}
                            />
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleStatusChange(customer.id)}
                      >
                        {customer.isActive ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDelete(customer.id)}
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
