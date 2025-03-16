
import { CardContent } from "@/components/ui/card";
import { WhatsAppConnected } from "../WhatsAppConnected";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { WhatsAppInstance } from "@/utils/messaging";

interface WhatsAppConnectedViewProps {
  instance: WhatsAppInstance;
  loading: boolean;
  error: string | null;
  onDisconnect: () => void;
}

export function WhatsAppConnectedView({ 
  instance, 
  loading, 
  error, 
  onDisconnect 
}: WhatsAppConnectedViewProps) {
  return (
    <CardContent className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <WhatsAppConnected
        instance={instance}
        loading={loading}
        onDisconnect={onDisconnect}
      />
    </CardContent>
  );
}
