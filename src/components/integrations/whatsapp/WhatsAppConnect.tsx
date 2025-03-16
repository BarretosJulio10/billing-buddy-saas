
import { CardContent } from "@/components/ui/card";
import { WhatsAppQRCode } from "../WhatsAppQRCode";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, QrCode, Info } from "lucide-react";
import { WhatsAppInstance } from "@/utils/messaging";

interface WhatsAppConnectProps {
  instance: WhatsAppInstance | null;
  loading: boolean;
  error: string | null;
  onConnect: () => void;
}

export function WhatsAppConnect({ 
  instance, 
  loading, 
  error, 
  onConnect 
}: WhatsAppConnectProps) {
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
        <AlertTitle>Passo 2: Conectar WhatsApp</AlertTitle>
        <AlertDescription>
          Instância <strong>{instance?.instanceName}</strong> criada com sucesso.
          Agora clique no botão abaixo para gerar o QR code e escaneie com seu WhatsApp para conectar.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4 p-4 border rounded-md shadow-sm bg-white">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Conectar WhatsApp</h3>
          <p className="text-sm text-muted-foreground">
            Clique no botão para gerar o QR code e escaneie-o com seu aplicativo WhatsApp.
          </p>
        </div>
        
        <WhatsAppQRCode
          qrCode={instance?.qrCode}
          loading={loading}
          onConnect={onConnect}
        />
      </div>
    </CardContent>
  );
}
