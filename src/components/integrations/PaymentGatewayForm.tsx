
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type PaymentGateway = "mercadopago" | "asaas";

const mercadoPagoSchema = z.object({
  clientId: z.string().min(1, "Client ID é obrigatório"),
  clientSecret: z.string().min(1, "Client Secret é obrigatório"),
});

const asaasSchema = z.object({
  apiKey: z.string().min(1, "API Key é obrigatória"),
  environment: z.enum(["sandbox", "production"]),
});

interface PaymentGatewayFormProps {
  gateway: PaymentGateway;
  onSuccess?: () => void;
}

export function PaymentGatewayForm({ gateway, onSuccess }: PaymentGatewayFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "authenticated" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mercadoPagoForm = useForm<z.infer<typeof mercadoPagoSchema>>({
    resolver: zodResolver(mercadoPagoSchema),
    defaultValues: {
      clientId: "",
      clientSecret: "",
    },
  });

  const asaasForm = useForm<z.infer<typeof asaasSchema>>({
    resolver: zodResolver(asaasSchema),
    defaultValues: {
      apiKey: "",
      environment: "sandbox",
    },
  });

  const saveMercadoPagoSettings = async (data: z.infer<typeof mercadoPagoSchema>) => {
    try {
      setStatus("loading");
      setError(null);
      
      // Mock API call to validate and save credentials
      setTimeout(() => {
        setStatus("authenticated");
        toast({
          title: "Configurações salvas",
          description: "As configurações do Mercado Pago foram salvas com sucesso.",
        });
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (err) {
      setStatus("error");
      setError("Erro ao salvar as configurações. Verifique os dados e tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações do Mercado Pago.",
      });
    }
  };

  const saveAsaasSettings = async (data: z.infer<typeof asaasSchema>) => {
    try {
      setStatus("loading");
      setError(null);
      
      // Mock API call to validate and save credentials
      setTimeout(() => {
        setStatus("authenticated");
        toast({
          title: "Configurações salvas",
          description: "As configurações do Asaas foram salvas com sucesso.",
        });
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (err) {
      setStatus("error");
      setError("Erro ao salvar as configurações. Verifique os dados e tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações do Asaas.",
      });
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setError(null);
    if (gateway === "mercadopago") {
      mercadoPagoForm.reset();
    } else {
      asaasForm.reset();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {gateway === "mercadopago" ? "Mercado Pago" : "Asaas"}
        </CardTitle>
        <CardDescription>
          Configure sua integração com {gateway === "mercadopago" ? "o Mercado Pago" : "o Asaas"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "idle" && gateway === "mercadopago" && (
          <Form {...mercadoPagoForm}>
            <form onSubmit={mercadoPagoForm.handleSubmit(saveMercadoPagoSettings)} className="space-y-4">
              <FormField
                control={mercadoPagoForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input placeholder="CLIENT_ID_123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={mercadoPagoForm.control}
                name="clientSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Secret</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="CLIENT_SECRET_123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Salvar Configurações
              </Button>
            </form>
          </Form>
        )}

        {status === "idle" && gateway === "asaas" && (
          <Form {...asaasForm}>
            <form onSubmit={asaasForm.handleSubmit(saveAsaasSettings)} className="space-y-4">
              <FormField
                control={asaasForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="$aas$_restapi_1234567890abcdef" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={asaasForm.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ambiente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ambiente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Produção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Salvar Configurações
              </Button>
            </form>
          </Form>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Verificando e salvando configurações...</p>
          </div>
        )}

        {status === "authenticated" && (
          <div className="flex items-center justify-center py-8 text-green-500">
            <Check className="h-8 w-8 mr-2" />
            <span className="text-lg font-medium">Configurações salvas com sucesso!</span>
          </div>
        )}

        {status === "error" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      {(status === "error" || status === "authenticated") && (
        <CardFooter className="flex justify-end">
          <Button 
            variant={status === "error" ? "default" : "outline"}
            onClick={handleRetry}
          >
            {status === "error" ? "Tentar novamente" : "Atualizar Configurações"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
