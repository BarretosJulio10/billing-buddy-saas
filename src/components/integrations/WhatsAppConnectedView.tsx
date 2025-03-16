
import { CardContent } from "@/components/ui/card";
import { WhatsAppInstance } from "@/utils/messaging";
import { WhatsAppConnected } from "./WhatsAppConnected";

interface WhatsAppConnectedViewProps {
  instance: WhatsAppInstance;
  loading: boolean;
  error: string | null;
  onDisconnect: () => void;
}

export function WhatsAppConnectedView({ instance, loading, error, onDisconnect }: WhatsAppConnectedViewProps) {
  return (
    <CardContent className="pt-6">
      <WhatsAppConnected
        instance={instance}
        loading={loading}
        onDisconnect={onDisconnect}
      />
    </CardContent>
  );
}
