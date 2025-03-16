
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CopyIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CollectionRuleForm } from "./CollectionRuleForm";
import { CollectionRule } from "./types";
import { useState } from "react";

interface CollectionRuleActionsProps {
  rule: CollectionRule & { overdueDaysAfter: number[] };
  onEdit: (updatedRule: any) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CollectionRuleActions({ 
  rule, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: CollectionRuleActionsProps) {
  const [ruleToEdit, setRuleToEdit] = useState<CollectionRule | null>(null);

  const handleSaveRule = (updatedRule: any) => {
    onEdit(updatedRule);
    setRuleToEdit(null);
  };

  return (
    <div className="flex justify-end gap-2">
      <TooltipProvider>
        <Sheet>
          <Tooltip>
            <TooltipTrigger asChild>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setRuleToEdit(rule)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </SheetTrigger>
            </TooltipTrigger>
            <TooltipContent>Editar modelo</TooltipContent>
          </Tooltip>
          <SheetContent className="w-full sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>Editar Modelo de Cobrança</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {ruleToEdit && (
                <CollectionRuleForm 
                  initialData={{
                    name: ruleToEdit.name,
                    isActive: ruleToEdit.isActive,
                    reminderDaysBefore: ruleToEdit.reminderDaysBefore,
                    sendOnDueDate: ruleToEdit.sendOnDueDate,
                    overdueDaysAfter: ruleToEdit.overdueDaysAfter.join(', '),
                    reminderTemplate: ruleToEdit.reminderTemplate,
                    dueDateTemplate: ruleToEdit.dueDateTemplate,
                    overdueTemplate: ruleToEdit.overdueTemplate,
                    confirmationTemplate: ruleToEdit.confirmationTemplate,
                  }}
                  onSubmit={handleSaveRule}
                  onCancel={() => setRuleToEdit(null)}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onDuplicate(rule.id)}
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Duplicar modelo</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onDelete(rule.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remover modelo</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
