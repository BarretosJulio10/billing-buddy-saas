
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

const Invoices = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAddInvoice = (data: any) => {
    // This will be integrated with Supabase later
    toast({
      title: "Fatura criada",
      description: "A nova fatura foi criada com sucesso.",
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Faturas</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Fatura
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>Nova Fatura</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <InvoiceForm 
                onSubmit={handleAddInvoice}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <InvoiceTable />
    </div>
  );
};

export default Invoices;
