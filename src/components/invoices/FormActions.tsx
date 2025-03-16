
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isEditing: boolean;
  onCancel?: () => void;
}

export function FormActions({ isEditing, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-2 justify-end">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      )}
      <Button type="submit">
        {isEditing ? "Atualizar Fatura" : "Criar Fatura"}
      </Button>
    </div>
  );
}
