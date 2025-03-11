
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
  FormDescription,
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
import { Switch } from "@/components/ui/switch";

export type CollectionRule = {
  id: string;
  name: string;
  isActive: boolean;
  reminderDaysBefore: number;
  sendOnDueDate: boolean;
  overdueDaysAfter: number[];
  reminderTemplate: string;
  dueDateTemplate: string;
  overdueTemplate: string;
  confirmationTemplate: string;
};

const collectionRuleSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  isActive: z.boolean().default(true),
  reminderDaysBefore: z.coerce.number().int().min(0),
  sendOnDueDate: z.boolean().default(true),
  overdueDaysAfter: z.string(),
  reminderTemplate: z.string().min(10, "Template deve ter no mínimo 10 caracteres"),
  dueDateTemplate: z.string().min(10, "Template deve ter no mínimo 10 caracteres"),
  overdueTemplate: z.string().min(10, "Template deve ter no mínimo 10 caracteres"),
  confirmationTemplate: z.string().min(10, "Template deve ter no mínimo 10 caracteres"),
});

type CollectionRuleFormData = z.infer<typeof collectionRuleSchema>;

interface CollectionRuleFormProps {
  initialData?: Omit<CollectionRule, "id" | "overdueDaysAfter"> & { overdueDaysAfter: string };
  onSubmit: (data: CollectionRuleFormData) => void;
  onCancel?: () => void;
}

export function CollectionRuleForm({ initialData, onSubmit, onCancel }: CollectionRuleFormProps) {
  const form = useForm<CollectionRuleFormData>({
    resolver: zodResolver(collectionRuleSchema),
    defaultValues: initialData || {
      name: "",
      isActive: true,
      reminderDaysBefore: 3,
      sendOnDueDate: true,
      overdueDaysAfter: "1,3,5,10",
      reminderTemplate: "Olá {cliente}, lembre-se que sua fatura de {valor} vence em {dias_para_vencer} dias.",
      dueDateTemplate: "Olá {cliente}, sua fatura de {valor} vence hoje. Link de pagamento: {link}",
      overdueTemplate: "Olá {cliente}, sua fatura de {valor} está atrasada há {dias_atraso} dias. Link de pagamento: {link}",
      confirmationTemplate: "Olá {cliente}, confirmamos o recebimento do pagamento da sua fatura de {valor}. Obrigado!",
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = (data: CollectionRuleFormData) => {
    onSubmit(data);
    if (!initialData) {
      form.reset({
        name: "",
        isActive: true,
        reminderDaysBefore: 3,
        sendOnDueDate: true,
        overdueDaysAfter: "1,3,5,10",
        reminderTemplate: "Olá {cliente}, lembre-se que sua fatura de {valor} vence em {dias_para_vencer} dias.",
        dueDateTemplate: "Olá {cliente}, sua fatura de {valor} vence hoje. Link de pagamento: {link}",
        overdueTemplate: "Olá {cliente}, sua fatura de {valor} está atrasada há {dias_atraso} dias. Link de pagamento: {link}",
        confirmationTemplate: "Olá {cliente}, confirmamos o recebimento do pagamento da sua fatura de {valor}. Obrigado!",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Modelo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do modelo de cobrança" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Ativo</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reminderDaysBefore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dias de Antecedência para Lembrete</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="3"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Dias antes do vencimento para enviar um lembrete.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sendOnDueDate"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Enviar no Dia do Vencimento</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="overdueDaysAfter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dias de Atraso para Cobrança</FormLabel>
              <FormControl>
                <Input
                  placeholder="1,3,5,10"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Dias após o vencimento para enviar cobranças de atraso, separados por vírgula.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reminderTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template de Lembrete</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Texto do lembrete antes do vencimento"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use {'{cliente}'}, {'{valor}'}, {'{dias_para_vencer}'}, {'{link}'} como variáveis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDateTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template do Dia do Vencimento</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Texto da mensagem no dia do vencimento"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use {'{cliente}'}, {'{valor}'}, {'{link}'} como variáveis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="overdueTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template de Atraso</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Texto da mensagem de cobrança de atraso"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use {'{cliente}'}, {'{valor}'}, {'{dias_atraso}'}, {'{link}'} como variáveis.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmationTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template de Confirmação</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Texto da mensagem de confirmação de pagamento"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use {'{cliente}'}, {'{valor}'} como variáveis.
              </FormDescription>
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
            {initialData ? "Atualizar Modelo" : "Salvar Modelo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
