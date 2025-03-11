
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WhatsAppQRScannerProps {
  apiEndpoint: string;
  onSuccess?: () => void;
}

export function WhatsAppQRScanner({ apiEndpoint, onSuccess }: WhatsAppQRScannerProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "authenticated" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const connectWhatsApp = async () => {
    try {
      setStatus("loading");
      setError(null);
      
      // This is a mock implementation. In a real implementation, 
      // you would connect to your WhatsApp API endpoint
      setTimeout(() => {
        // Mock QR code data URL
        setQrCode("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAAB7ElEQVRo3u2ZMYrjQBBFX0mYta/gozjyUTyKb+AjOFqDYdqpCgaSDoTuWYNh/rjB9Vu/qkVV8+c/6g0vL/oTgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhAAAIQgAAEIPABgM3X1gkhz7OtrXWzRyTg8ny2mGbft5H29r5ngM0m3xbnOeVr63/MIc9+OPvsrRxqjwAmzzZFpqyB9eWpwJxtX0bsswMYYu+d8aFawgDjPOcYLr0cKjAOdii2V6AH0IbIcehhQA9Aj9a8FwDlp5YZXcl6A1SKlJIVUGJ1q9vcrVYAtWmzzZ61vgAojbO57L0CjhLbUDUGsD0OoBPWF+BFp6IlUYBLctlKvQPXDZWpSuEzgJJa9iZfrwDacNlrTdaWPwE0bbC9tXsXKJXfnzJh5I8CNW26qGQYbwGQr0Hv3MHqAyB0/UON+gwojQr3L+tVzLYDEjJvdLgMewakZYhiV39+HsQJZCHIrw5AsV33LTv97XVIhaBYlrz1uhdAe9lCsMgU3wEpBPL8tLfDAdiy5V18Wpy0vQKWX/A8wOb7gPPsvuwvQJ0H3SL92aZpvJfj67x90mj6BVAjTm0mAQhAAAIQgAAEIAABCEAAAhCAAAQgAAEIQAACEIAABCAAAQhA4I8Q+AVnEWhgG+TBfgAAAABJRU5ErkJggg==");
      }, 1500);

      // Mock successful authentication after 5 seconds
      const successTimer = setTimeout(() => {
        setStatus("authenticated");
        setQrCode(null);
        toast({
          title: "WhatsApp conectado",
          description: "Sua conta WhatsApp foi conectada com sucesso.",
        });
        if (onSuccess) onSuccess();
      }, 10000);

      return () => clearTimeout(successTimer);
    } catch (err) {
      setStatus("error");
      setError("Erro ao conectar com WhatsApp. Tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro na conexão",
        description: "Não foi possível conectar ao WhatsApp. Tente novamente.",
      });
    }
  };

  const handleRetry = () => {
    setStatus("idle");
    setError(null);
    setQrCode(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conectar WhatsApp</CardTitle>
        <CardDescription>
          Escaneie o QR code com seu WhatsApp para conectar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {status === "idle" && (
          <Button onClick={connectWhatsApp} className="mb-4">
            Gerar QR Code
          </Button>
        )}

        {status === "loading" && !qrCode && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
          </div>
        )}

        {qrCode && (
          <div className="flex flex-col items-center justify-center py-4">
            <img 
              src={qrCode} 
              alt="WhatsApp QR Code" 
              className="w-64 h-64 mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Abra o WhatsApp no seu telefone, toque em Menu ou Configurações e selecione WhatsApp Web. 
              Aponte seu telefone para esta tela para capturar o código.
            </p>
          </div>
        )}

        {status === "authenticated" && (
          <div className="flex items-center justify-center py-8 text-green-500">
            <Check className="h-8 w-8 mr-2" />
            <span className="text-lg font-medium">WhatsApp conectado com sucesso!</span>
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
