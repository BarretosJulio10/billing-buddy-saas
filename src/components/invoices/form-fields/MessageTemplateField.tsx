
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormData, mockTemplates } from "../types";

interface MessageTemplateFieldProps {
  form: UseFormReturn<InvoiceFormData>;
}

export function MessageTemplateField({ form }: MessageTemplateFieldProps) {
  return (
    <FormField
      control={form.control}
      name="messageTemplateId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Modelo de Mensagem</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {mockTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
