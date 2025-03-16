import { Wifi, WifiOff, MessageCircle, MessageCircleOff, Database, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { messagingUtils } from "@/utils/messaging";

interface ServiceStatus {
  connected: boolean;
  lastConnection?: string;
  ping?: string;
}

interface SystemStatusProps {
  whatsappStatus: ServiceStatus;
  telegramStatus: ServiceStatus;
  databaseStatus: ServiceStatus;
  loading?: boolean;
}

export function SystemStatus() {
  const { organizationId } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState({
    whatsappStatus: { connected: false, lastConnection: "" },
    telegramStatus: { connected: false, lastConnection: "" },
    databaseStatus: { connected: true, ping: "28ms" }
  });

  useEffect(() => {
    if (organizationId) {
      checkWhatsAppStatus();
      
      const pollingInterval = setInterval(() => {
        if (organizationId) {
          checkWhatsAppStatus();
        }
      }, 120000);

      return () => clearInterval(pollingInterval);
    }
  }, [organizationId]);

  const checkWhatsAppStatus = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const instanceSettings = await messagingUtils.getWhatsAppInstanceSettings(organizationId);
      console.log("Instance settings in status check:", instanceSettings);
      
      if (instanceSettings.success && instanceSettings.instanceName) {
        const result = await messagingUtils.checkWhatsAppConnection(instanceSettings.instanceName);
        console.log("WhatsApp connection status:", result);
        
        setStatusData(prev => ({
          ...prev,
          whatsappStatus: {
            connected: result.success && result.connected,
            lastConnection: new Date().toISOString()
          }
        }));
      } else {
        setStatusData(prev => ({
          ...prev,
          whatsappStatus: {
            connected: false,
            lastConnection: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      console.error("Error checking WhatsApp status in sidebar:", error);
      setStatusData(prev => ({
        ...prev,
        whatsappStatus: {
          connected: false,
          lastConnection: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="px-3 py-2">
      <div className="text-sm font-medium mb-2 flex items-center justify-between">
        <span>Status do Sistema</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusData.whatsappStatus.connected ? (
            <Wifi className="h-4 w-4 text-emerald-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
          <span className="text-sm">WhatsApp</span>
        </div>
        <StatusIndicator connected={statusData.whatsappStatus.connected} color="emerald" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusData.telegramStatus.connected ? (
            <MessageCircle className="h-4 w-4 text-blue-500" />
          ) : (
            <MessageCircleOff className="h-4 w-4 text-destructive" />
          )}
          <span className="text-sm">Telegram</span>
        </div>
        <StatusIndicator connected={statusData.telegramStatus.connected} color="blue" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-500" />
          <span className="text-sm">Banco de Dados</span>
        </div>
        <StatusIndicator connected={statusData.databaseStatus.connected} color="blue" />
      </div>
    </div>
  );
}

interface StatusIndicatorProps {
  connected: boolean;
  color: "emerald" | "blue";
}

function StatusIndicator({ connected, color }: StatusIndicatorProps) {
  const bgColorClass = color === "emerald" ? "bg-emerald-500" : "bg-blue-500";
  const textColorClass = color === "emerald" ? "text-emerald-500" : "text-blue-500";
  
  if (connected) {
    return (
      <div className="flex items-center">
        <div className={`h-2 w-2 rounded-full ${bgColorClass} mr-1.5`}></div>
        <span className={`text-sm ${textColorClass}`}>Online</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <div className="h-2 w-2 rounded-full bg-destructive mr-1.5"></div>
      <span className="text-sm text-destructive">Offline</span>
    </div>
  );
}
