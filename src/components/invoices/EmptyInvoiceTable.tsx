
import { TableCell, TableRow } from "@/components/ui/table";

export function EmptyInvoiceTable() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
        Nenhuma fatura encontrada
      </TableCell>
    </TableRow>
  );
}
