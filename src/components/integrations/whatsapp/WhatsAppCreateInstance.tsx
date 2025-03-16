
import { CardContent } from "@/components/ui/card";
import { WhatsAppInstanceForm } from "../WhatsAppInstanceForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface WhatsAppCreateInstanceProps {
  defaultInstanceName: string;
  loading: boolean;
  error: string | null;
  onSubmit: (values: { instanceName: string }) => Promise<void>;
}

export function WhatsAppCreateInstance({ 
  defaultInstanceName, 
  loading, 
  error, 
  onSubmit 
}: WhatsAppCreateInstanceProps) {
  return (
    <CardContent className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Alert variant="info" className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Passo 1: Criar instância</AlertTitle>
        <AlertDescription>
          Digite um nome para sua instância do WhatsApp no campo abaixo. Use apenas letras, números e underscores (_).
        </AlertDescription>
      </Alert>
      
      <div className="p-4 border rounded-md shadow-sm bg-white">
        <h3 className="text-lg font-medium mb-2">Nome da Instância</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este nome identificará sua conta do WhatsApp no sistema. Escolha um nome simples de lembrar.
        </p>
        
        <WhatsAppInstanceForm 
          defaultInstanceName={defaultInstanceName}
          loading={loading}
          onSubmit={onSubmit}
        />
      </div>
    </CardContent>
  );
}
