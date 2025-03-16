
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
import { InvoiceFormData } from "@/components/invoices/types";
import { supabase } from "@/integrations/supabase/client";

const Invoices = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddInvoice = async (data: InvoiceFormData) => {
    try {
      setIsSubmitting(true);
      
      // Format the due date as an ISO string for Supabase
      const dueDateStr = data.dueDate instanceof Date 
        ? data.dueDate.toISOString().split('T')[0] 
        : data.dueDate;
      
      // Insert invoice into Supabase
      const { error } = await supabase
        .from('invoices')
        .insert({
          customer_id: data.customerId,
          amount: data.amount,
          description: data.description,
          due_date: dueDateStr,
          payment_method: data.paymentMethod,
          collection_rule_id: data.messageTemplateId,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Fatura criada",
        description: "A nova fatura foi criada com sucesso.",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Erro ao criar fatura",
        description: "Ocorreu um erro ao criar a fatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
}

export default Invoices;
