
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invoice } from "./InvoiceForm";
import { useToast } from "@/components/ui/use-toast";
import { InvoiceSearch } from "./InvoiceSearch";
import { InvoiceTableRow } from "./InvoiceTableRow";
import { EmptyInvoiceTable } from "./EmptyInvoiceTable";

export function InvoiceTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id));
    toast({
      title: "Fatura removida",
      description: "A fatura foi movida para a lixeira.",
      variant: "destructive",
    });
  };

  const handleSaveInvoice = (updatedInvoice: any) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === updatedInvoice.id
          ? { 
              ...invoice, 
              ...updatedInvoice,
            }
          : invoice
      )
    );
    toast({
      title: "Fatura atualizada",
      description: "Os dados da fatura foram atualizados com sucesso.",
    });
  };

  const handleSendInvoice = (id: string) => {
    toast({
      title: "Cobrança enviada",
      description: "A cobrança foi enviada para o cliente com sucesso.",
    });
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
      <InvoiceSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

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
              <EmptyInvoiceTable />
            ) : (
              filteredInvoices.map((invoice) => (
                <InvoiceTableRow
                  key={invoice.id}
                  invoice={invoice}
                  onEdit={handleSaveInvoice}
                  onDelete={handleDelete}
                  onMarkAsPaid={handleMarkAsPaid}
                  onCancel={handleCancelInvoice}
                  onSendInvoice={handleSendInvoice}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
