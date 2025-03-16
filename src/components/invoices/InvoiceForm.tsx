
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { 
  CustomerField,
  AmountField,
  DescriptionField,
  DueDateField,
  PaymentMethodField,
  MessageTemplateField
} from "./form-fields";
import { FormActions } from "./FormActions";
import { 
  Invoice, 
  InvoiceFormData, 
  invoiceSchema 
} from "./types";

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <CustomerField form={form} />
        <AmountField form={form} />
        <DescriptionField form={form} />
        <DueDateField form={form} />
        <PaymentMethodField form={form} />
        <MessageTemplateField form={form} />
        <FormActions 
          isEditing={!!initialData} 
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
}
