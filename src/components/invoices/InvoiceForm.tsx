
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero"),
  description: z.string().min(1, "Descrição é obrigatória"),
  dueDate: z.date(),
  paymentMethod: z.enum(["mercadopago", "asaas"]),
  messageTemplateId: z.string().min(1, "Modelo de mensagem é obrigatório"),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

// Mock data until Supabase integration
const mockCustomers = [
  { id: "1", name: "João Silva" },
  { id: "2", name: "Maria Oliveira" },
  { id: "3", name: "Pedro Santos" },
];

const mockTemplates = [
  { id: "1", name: "Modelo Padrão" },
  { id: "2", name: "Modelo Premium" },
  { id: "3", name: "Modelo Educacional" },
];

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
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição da fatura"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Vencimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                  <SelectItem value="asaas">Asaas</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {initialData ? "Atualizar Fatura" : "Criar Fatura"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
