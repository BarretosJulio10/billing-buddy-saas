
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomerTable, Customer } from "@/components/customers/CustomerTable";
import { CustomerForm } from "@/components/customers/CustomerForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

const Customers = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAddCustomer = (data: Omit<Customer, "id">) => {
    // This will be integrated with Supabase later
    toast({
      title: "Cliente adicionado",
      description: "O novo cliente foi adicionado com sucesso.",
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>Novo Cliente</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <CustomerForm 
                onSubmit={handleAddCustomer}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <CustomerTable />
    </div>
  );
};

export default Customers;
