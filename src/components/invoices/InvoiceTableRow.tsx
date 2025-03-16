
import { TableCell, TableRow } from "@/components/ui/table";
import { Invoice } from "./InvoiceForm";
import { InvoiceStatus } from "./InvoiceStatus";
import { InvoiceActions } from "./InvoiceActions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InvoiceTableRowProps {
  invoice: Invoice;
  onEdit: (updatedInvoice: any) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onCancel: (id: string) => void;
  onSendInvoice: (id: string) => void;
}

export function InvoiceTableRow({
  invoice,
  onEdit,
  onDelete,
  onMarkAsPaid,
  onCancel,
  onSendInvoice
}: InvoiceTableRowProps) {
  return (
    <TableRow>
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
      <TableCell><InvoiceStatus status={invoice.status} /></TableCell>
      <TableCell>
        {invoice.paymentMethod === "mercadopago" ? "Mercado Pago" : "Asaas"}
      </TableCell>
      <TableCell className="text-right">
        <InvoiceActions 
          invoice={invoice}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkAsPaid={onMarkAsPaid}
          onCancel={onCancel}
          onSendInvoice={onSendInvoice}
        />
      </TableCell>
    </TableRow>
  );
}
