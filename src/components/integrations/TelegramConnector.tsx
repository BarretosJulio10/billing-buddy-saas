
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

const telegramSchema = z.object({
  botToken: z.string().min(1, "Token do bot é obrigatório"),
  chatId: z.string().min(1, "ID do chat é obrigatório"),
});

type TelegramFormData = z.infer<typeof telegramSchema>;

interface TelegramConnectorProps {
  onSuccess?: () => void;
}

export function TelegramConnector({ onSuccess }: TelegramConnectorProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "authenticated" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TelegramFormData>({
    resolver: zodResolver(telegramSchema),
    defaultValues: {
      botToken: "",
      chatId: "",
    },
  });

  const connectTelegram = async (data: TelegramFormData) => {
    try {
      setStatus("loading");
      setError(null);
      
      // This is a mock implementation. In a real scenario, you would
      // validate the Telegram bot token and chat ID with the Telegram API
      setTimeout(() => {
        setStatus("authenticated");
        toast({
          title: "Telegram conectado",
          description: "Seu bot do Telegram foi conectado com sucesso.",
        });
        if (onSuccess) onSuccess();
      }, 2000);
      
    } catch (err) {
      setStatus("error");
      setError("Erro ao conectar com Telegram. Verifique os dados e tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro na conexão",
        description: "Não foi possível conectar ao Telegram. Verifique os dados e tente novamente.",
      });
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setError(null);
    form.reset();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conectar Telegram</CardTitle>
        <CardDescription>
          Configure seu bot do Telegram para enviar mensagens
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "idle" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(connectTelegram)} className="space-y-4">
              <FormField
                control={form.control}
                name="botToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token do Bot</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chatId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID do Chat</FormLabel>
                    <FormControl>
                      <Input placeholder="-1001234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Conectar Telegram
              </Button>
            </form>
          </Form>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Verificando conexão...</p>
          </div>
        )}

        {status === "authenticated" && (
          <div className="flex items-center justify-center py-8 text-green-500">
            <Check className="h-8 w-8 mr-2" />
            <span className="text-lg font-medium">Telegram conectado com sucesso!</span>
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
            {status === "error" ? "Tentar novamente" : "Reconectar"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
