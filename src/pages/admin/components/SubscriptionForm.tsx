
import { Organization } from "@/types/organization";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const subscriptionSchema = z.object({
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0, 
    { message: "Value must be a positive number" }
  ),
  dueDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)), 
    { message: "Invalid date" }
  ),
  gateway: z.enum(["mercadopago", "asaas"])
});

interface SubscriptionFormProps {
  organization: Organization;
  onSubmit: (data: z.infer<typeof subscriptionSchema>) => Promise<void>;
}

export function SubscriptionForm({ organization, onSubmit }: SubscriptionFormProps) {
  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      amount: organization.subscriptionAmount.toString(),
      dueDate: organization.subscriptionDueDate.split('T')[0],
      gateway: organization.gateway
    }
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Atualizar Assinatura</DialogTitle>
        <DialogDescription>
          Atualize os detalhes da assinatura para {organization.name}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Mensal (R$)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gateway"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gateway de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um gateway" />
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
          
          <DialogFooter>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
