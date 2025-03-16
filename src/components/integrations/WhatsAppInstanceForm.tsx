
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Form schema for instance creation
const instanceFormSchema = z.object({
  instanceName: z.string()
    .min(3, "Nome da instância deve ter no mínimo 3 caracteres")
    .max(30, "Nome da instância deve ter no máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e underscores"),
});

type InstanceFormValues = z.infer<typeof instanceFormSchema>;

interface WhatsAppInstanceFormProps {
  defaultInstanceName: string;
  loading: boolean;
  onSubmit: (values: InstanceFormValues) => Promise<void>;
}

export function WhatsAppInstanceForm({ defaultInstanceName, loading, onSubmit }: WhatsAppInstanceFormProps) {
  const form = useForm<InstanceFormValues>({
    resolver: zodResolver(instanceFormSchema),
    defaultValues: {
      instanceName: defaultInstanceName,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="instanceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Nome da Instância WhatsApp</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="ex: minha_empresa" 
                  className="text-base h-12 border-2 focus:border-primary"
                />
              </FormControl>
              <FormDescription>
                Use apenas letras, números e underscores. Este será o identificador único da sua instância do WhatsApp.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full h-12 text-base font-medium">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Criando instância...
            </>
          ) : (
            "Criar Instância WhatsApp"
          )}
        </Button>
      </form>
    </Form>
  );
}
