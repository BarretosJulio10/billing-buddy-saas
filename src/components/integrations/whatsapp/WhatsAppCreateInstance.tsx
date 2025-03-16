
import { CardContent } from "@/components/ui/card";
import { WhatsAppInstanceForm } from "../WhatsAppInstanceForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, ArrowRight, CheckCircle2 } from "lucide-react";

interface WhatsAppCreateInstanceProps {
  defaultInstanceName: string;
  loading: boolean;
  error: string | null;
  onSubmit: (values: { instanceName: string }) => Promise<void>;
  isInstanceSaved: boolean;
}

export function WhatsAppCreateInstance({ 
  defaultInstanceName, 
  loading, 
  error, 
  onSubmit,
  isInstanceSaved 
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
      
      <Alert variant="info" className="bg-blue-50">
        <Info className="h-4 w-4" />
        <AlertTitle>Passo 1: Criar instância</AlertTitle>
        <AlertDescription>
          Digite um nome para sua instância do WhatsApp no campo abaixo. Use apenas letras, números e underscores (_).
          {isInstanceSaved && (
            <div className="mt-2 flex items-center text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span>Nome da instância salvo com sucesso!</span>
            </div>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="p-4 border rounded-md shadow-sm bg-white">
        <h3 className="text-lg font-medium mb-2">Nome da Instância</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Este nome identificará sua conta do WhatsApp no sistema. Escolha um nome simples de lembrar.
        </p>
        
        {isInstanceSaved ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
            <div className="font-medium">{defaultInstanceName}</div>
            <div className="text-green-600 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              <span>Salvo</span>
            </div>
          </div>
        ) : (
          <WhatsAppInstanceForm 
            defaultInstanceName={defaultInstanceName}
            loading={loading}
            onSubmit={onSubmit}
          />
        )}
        
        {isInstanceSaved && (
          <div className="mt-4 text-sm text-center text-blue-700 flex items-center justify-center">
            <ArrowRight className="h-4 w-4 mr-1" />
            <span>Agora você pode conectar seu WhatsApp no próximo passo</span>
          </div>
        )}
      </div>
    </CardContent>
  );
}
