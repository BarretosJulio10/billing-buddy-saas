
import { Badge } from "@/components/ui/badge";
import { Invoice } from "./InvoiceForm";

interface InvoiceStatusProps {
  status: Invoice["status"];
}

export function InvoiceStatus({ status }: InvoiceStatusProps) {
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
}
