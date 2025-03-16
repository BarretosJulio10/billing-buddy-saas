
import { useState } from "react";
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { InvoiceForm, Invoice } from "./InvoiceForm";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvoiceActionsProps {
  invoice: Invoice;
  onEdit: (updatedInvoice: any) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onCancel: (id: string) => void;
  onSendInvoice: (id: string) => void;
}

export function InvoiceActions({
  invoice,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onCancel,
  onSendInvoice
}: InvoiceActionsProps) {
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);

  const handleSaveInvoice = (updatedInvoice: any) => {
    onEdit(updatedInvoice);
    setInvoiceToEdit(null);
  };

  return (
    <div className="flex justify-end gap-1">
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Send className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Enviar cobrança</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSendInvoice(invoice.id)}>
              Enviar por WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendInvoice(invoice.id)}>
              Enviar por Telegram
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Sheet>
          <Tooltip>
            <TooltipTrigger asChild>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setInvoiceToEdit(invoice)}
                  className="h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </TooltipTrigger>
            <TooltipContent>Editar fatura</TooltipContent>
          </Tooltip>
          <SheetContent className="w-full sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>Editar Fatura</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {invoiceToEdit && (
                <InvoiceForm 
                  initialData={{
                    customerId: invoiceToEdit.customerId,
                    amount: invoiceToEdit.amount,
                    description: invoiceToEdit.description,
                    dueDate: invoiceToEdit.dueDate,
                    paymentMethod: invoiceToEdit.paymentMethod,
                    messageTemplateId: invoiceToEdit.messageTemplateId,
                  }}
                  onSubmit={handleSaveInvoice}
                  onCancel={() => setInvoiceToEdit(null)}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
        
        {invoice.status !== "paid" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onMarkAsPaid(invoice.id)}
                className="h-8 w-8"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Marcar como pago</TooltipContent>
          </Tooltip>
        )}
        
        {invoice.status !== "cancelled" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => onCancel(invoice.id)}
                className="h-8 w-8"
              >
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancelar fatura</TooltipContent>
          </Tooltip>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(invoice.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mover para lixeira</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
