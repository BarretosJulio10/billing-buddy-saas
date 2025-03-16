
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormActions } from "./FormActions";
import { 
  Invoice, 
  InvoiceFormData, 
  invoiceSchema,
  mockCustomers,
  mockTemplates
} from "./types";
import { 
  InputField, 
  TextareaField, 
  SelectField, 
  DateField 
} from "@/components/form/fields";

export type { Invoice } from "./types";

interface InvoiceFormProps {
  initialData?: Omit<Invoice, "id" | "customerName" | "status">;
  onSubmit: (data: InvoiceFormData) => void;
  onCancel?: () => void;
}

export function InvoiceForm({ initialData, onSubmit, onCancel }: InvoiceFormProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData || {
      customerId: "",
      amount: 0,
      description: "",
      dueDate: new Date(),
      paymentMethod: "mercadopago",
      messageTemplateId: "",
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = (data: InvoiceFormData) => {
    onSubmit(data);
    if (!initialData) {
      form.reset({
        customerId: "",
        amount: 0,
        description: "",
        dueDate: new Date(),
        paymentMethod: "mercadopago",
        messageTemplateId: "",
      });
    }
  };

  const customerOptions = mockCustomers.map(customer => ({
    value: customer.id,
    label: customer.name,
  }));

  const paymentMethodOptions = [
    { value: "mercadopago", label: "Mercado Pago" },
    { value: "asaas", label: "Asaas" },
  ];

  const templateOptions = mockTemplates.map(template => ({
    value: template.id,
    label: template.name,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <SelectField 
          form={form} 
          name="customerId" 
          label="Cliente" 
          options={customerOptions}
          placeholder="Selecione um cliente"
        />
        
        <InputField 
          form={form} 
          name="amount" 
          label="Valor (R$)" 
          type="number"
          step="0.01"
          placeholder="0.00"
        />
        
        <TextareaField 
          form={form} 
          name="description" 
          label="Descrição" 
          placeholder="Descrição da fatura"
          className="resize-none"
        />
        
        <DateField 
          form={form} 
          name="dueDate" 
          label="Data de Vencimento" 
          disablePastDates={true}
        />
        
        <SelectField 
          form={form} 
          name="paymentMethod" 
          label="Método de Pagamento" 
          options={paymentMethodOptions}
          placeholder="Selecione um método"
        />
        
        <SelectField 
          form={form} 
          name="messageTemplateId" 
          label="Modelo de Mensagem" 
          options={templateOptions}
          placeholder="Selecione um modelo"
        />
        
        <FormActions 
          isEditing={!!initialData} 
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
