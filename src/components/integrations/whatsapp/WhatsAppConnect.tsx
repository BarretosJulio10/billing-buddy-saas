
import { CardContent } from "@/components/ui/card";
import { WhatsAppQRCode } from "../WhatsAppQRCode";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
      
      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-medium">Conectar WhatsApp</h3>
        <p className="text-sm text-muted-foreground">
          Instância <strong>{instance?.instanceName}</strong> criada com sucesso.
          Agora escaneie o código QR com seu WhatsApp para conectar.
        </p>
      </div>
      
      <WhatsAppQRCode
        qrCode={instance?.qrCode}
        loading={loading}
        onConnect={onConnect}
      />
    </CardContent>
  );
}
