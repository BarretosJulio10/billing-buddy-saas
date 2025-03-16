
import { z } from "zod";

export type Invoice = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  description: string;
  dueDate: Date;
  status: "pending" | "paid" | "overdue" | "cancelled";
  paymentMethod: "mercadopago" | "asaas";
  messageTemplateId: string;
};

export type MessageTemplate = {
  id: string;
  name: string;
  reminderTemplate: string;
  dueDateTemplate: string;
  overdueTemplate: string;
  confirmationTemplate: string;
};

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  description: z.string().min(1, "Descrição é obrigatória"),
  dueDate: z.date(),
  paymentMethod: z.enum(["mercadopago", "asaas"]),
  messageTemplateId: z.string().min(1, "Modelo de mensagem é obrigatório"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
