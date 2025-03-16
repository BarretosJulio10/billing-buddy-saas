
import { Button } from "@/components/ui/button";
import { Check, PhoneOff } from "lucide-react";
import { WhatsAppInstance } from "@/utils/messagingUtils";

interface WhatsAppConnectedProps {
  instance: WhatsAppInstance;
  loading: boolean;
  onDisconnect: () => void;
}

export function WhatsAppConnected({ instance, loading, onDisconnect }: WhatsAppConnectedProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              Conectado
            </p>
            {instance.number && (
              <p className="text-sm text-green-700 dark:text-green-400">
                Número: {instance.number}
              </p>
            )}
            {instance.instanceName && (
              <p className="text-sm text-green-700 dark:text-green-400">
                Instância: {instance.instanceName}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          variant="destructive" 
          onClick={onDisconnect} 
          disabled={loading}
          className="flex items-center gap-1"
        >
          <PhoneOff className="h-4 w-4 mr-1" />
          Desconectar
        </Button>
      </div>
    </div>
  );
}
