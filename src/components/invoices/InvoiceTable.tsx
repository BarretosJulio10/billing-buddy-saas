
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
import { 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Send
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InvoiceForm, Invoice } from "./InvoiceForm";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Temporary mock data until Supabase integration
const mockInvoices: Invoice[] = [
  { 
    id: "1", 
    customerId: "1", 
    customerName: "João Silva", 
    amount: 199.90, 
    description: "Mensalidade Agosto 2023", 
    dueDate: new Date(2023, 7, 10), 
    status: "paid",
    paymentMethod: "mercadopago",
    messageTemplateId: "1"
  },
  { 
    id: "2", 
    customerId: "2", 
    customerName: "Maria Oliveira", 
    amount: 129.90, 
    description: "Mensalidade Agosto 2023", 
    dueDate: new Date(2023, 7, 15), 
    status: "pending",
    paymentMethod: "asaas",
    messageTemplateId: "2"
  },
  { 
    id: "3", 
    customerId: "3", 
    customerName: "Pedro Santos", 
    amount: 79.90, 
    description: "Mensalidade Julho 2023", 
    dueDate: new Date(2023, 6, 5), 
    status: "overdue",
    paymentMethod: "mercadopago",
    messageTemplateId: "1"
  },
];

export function InvoiceTable() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    // In the future, this will mark as deleted in the database
    setInvoices(invoices.filter((invoice) => invoice.id !== id));
    toast({
      title: "Fatura removida",
      description: "A fatura foi movida para a lixeira.",
      variant: "destructive",
    });
  };

  const handleSaveInvoice = (updatedInvoice: any) => {
    if (invoiceToEdit) {
      // Update existing invoice
      setInvoices(
        invoices.map((invoice) =>
          invoice.id === invoiceToEdit.id
            ? { 
                ...invoice, 
                ...updatedInvoice,
                customerName: mockInvoices.find(c => c.customerId === updatedInvoice.customerId)?.customerName || ""
              }
            : invoice
        )
      );
      toast({
        title: "Fatura atualizada",
        description: "Os dados da fatura foram atualizados com sucesso.",
      });
    }
    setInvoiceToEdit(null);
  };

  const handleSendInvoice = (id: string) => {
    // Will be integrated with WhatsApp/Telegram API later
    toast({
      title: "Cobrança enviada",
      description: "A cobrança foi enviada para o cliente com sucesso.",
    });
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Pago</Badge>;
      case "pending":
        return <Badge variant="default">Pendente</Badge>;
      case "overdue":
        return <Badge variant="destructive">Atrasado</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return null;
    }
  };

  const handleCancelInvoice = (id: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id
          ? { ...invoice, status: "cancelled" }
          : invoice
      )
    );
    toast({
      title: "Fatura cancelada",
      description: "A fatura foi cancelada com sucesso.",
    });
  };

  const handleMarkAsPaid = (id: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id
          ? { ...invoice, status: "paid" }
          : invoice
      )
    );
    toast({
      title: "Fatura paga",
      description: "A fatura foi marcada como paga com sucesso.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar faturas..." 
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
              <TableHead>Cliente</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nenhuma fatura encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.customerName}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    {format(invoice.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    {invoice.paymentMethod === "mercadopago" ? "Mercado Pago" : "Asaas"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Send className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                            Enviar por WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                            Enviar por Telegram
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Sheet>
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                          className="h-8 w-8"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {invoice.status !== "cancelled" && (
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelInvoice(invoice.id)}
                          className="h-8 w-8"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(invoice.id)}
                        className="h-8 w-8"
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
