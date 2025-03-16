
import { SelectField } from "@/components/form/fields";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormData } from "../types";
import { useInvoiceData } from "@/hooks/useInvoiceData";

interface MessageTemplateFieldProps {
  form: UseFormReturn<InvoiceFormData>;
}

export function MessageTemplateField({ form }: MessageTemplateFieldProps) {
  const { templates, isLoading } = useInvoiceData();
  
  const templateOptions = templates.map(template => ({
    value: template.id,
    label: template.name,
  }));

  return (
    <SelectField 
      form={form} 
      name="messageTemplateId" 
      label="Modelo de Mensagem" 
      options={templateOptions}
      placeholder={isLoading ? "Carregando modelos..." : "Selecione um modelo"}
    />
  );
}
