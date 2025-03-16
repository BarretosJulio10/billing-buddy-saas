
import { TableCell, TableRow } from "@/components/ui/table";
import { CollectionRule } from "./types";
import { CollectionRuleStatus } from "./CollectionRuleStatus";
import { CollectionRuleActions } from "./CollectionRuleActions";

interface CollectionRuleTableRowProps {
  rule: CollectionRule & { overdueDaysAfter: number[] };
  onStatusChange: (id: string) => void;
  onEdit: (updatedRule: any) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CollectionRuleTableRow({
  rule,
  onStatusChange,
  onEdit,
  onDuplicate,
  onDelete,
}: CollectionRuleTableRowProps) {
  return (
    <TableRow key={rule.id}>
      <TableCell className="font-medium">{rule.name}</TableCell>
      <TableCell>{rule.reminderDaysBefore} dias antes</TableCell>
      <TableCell>{rule.overdueDaysAfter.join(', ')} dias depois</TableCell>
      <TableCell>
        <CollectionRuleStatus 
          isActive={rule.isActive} 
          onStatusChange={() => onStatusChange(rule.id)} 
        />
      </TableCell>
      <TableCell className="text-right">
        <CollectionRuleActions
          rule={rule}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}
