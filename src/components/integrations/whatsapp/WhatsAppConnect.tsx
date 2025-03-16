
import { CardContent } from "@/components/ui/card";
import { WhatsAppQRCode } from "../WhatsAppQRCode";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      
      <WhatsAppQRCode
        qrCode={instance?.qrCode}
        loading={loading}
        onConnect={onConnect}
      />
    </CardContent>
  );
}
