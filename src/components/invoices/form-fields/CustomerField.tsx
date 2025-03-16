
import { SelectField } from "@/components/form/fields";
import { UseFormReturn } from "react-hook-form";
import { InvoiceFormData } from "../types";
import { useInvoiceData } from "@/hooks/useInvoiceData";

interface CustomerFieldProps {
  form: UseFormReturn<InvoiceFormData>;
}

export function CustomerField({ form }: CustomerFieldProps) {
  const { customers, isLoading } = useInvoiceData();
  
  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: customer.name,
  }));

  return (
    <SelectField 
      form={form} 
      name="customerId" 
      label="Cliente" 
      options={customerOptions}
      placeholder={isLoading ? "Carregando clientes..." : "Selecione um cliente"}
    />
  );
}
