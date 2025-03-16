
import { TableCell, TableRow } from "@/components/ui/table";

export function EmptyCollectionRuleTable() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
        Nenhum modelo de cobrança encontrado
      </TableCell>
    </TableRow>
  );
}
