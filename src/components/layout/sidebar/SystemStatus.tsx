
import { Wifi, WifiOff, MessageCircle, MessageCircleOff, Database, Loader2 } from "lucide-react";

// This would normally come from an API
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

export function SystemStatus({ 
  whatsappStatus, 
  telegramStatus, 
  databaseStatus,
  loading = false
}: SystemStatusProps) {
  return (
    <div className="px-3 py-2">
      <div className="text-sm font-medium mb-2 flex items-center justify-between">
        <span>Status do Sistema</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
      
      {/* WhatsApp Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {whatsappStatus.connected ? (
            <Wifi className="h-4 w-4 text-emerald-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-destructive" />
          )}
          <span className="text-sm">WhatsApp</span>
        </div>
        <StatusIndicator connected={whatsappStatus.connected} color="emerald" />
      </div>

      {/* Telegram Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {telegramStatus.connected ? (
            <MessageCircle className="h-4 w-4 text-blue-500" />
          ) : (
            <MessageCircleOff className="h-4 w-4 text-destructive" />
          )}
          <span className="text-sm">Telegram</span>
        </div>
        <StatusIndicator connected={telegramStatus.connected} color="blue" />
      </div>
      
      {/* Database Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-500" />
          <span className="text-sm">Banco de Dados</span>
        </div>
        <StatusIndicator connected={databaseStatus.connected} color="blue" />
      </div>
    </div>
  );
}

interface StatusIndicatorProps {
  connected: boolean;
  color: "emerald" | "blue";
}

function StatusIndicator({ connected, color }: StatusIndicatorProps) {
  const colorClass = color === "emerald" ? "text-emerald-500" : "text-blue-500";
  
  if (connected) {
    return (
      <div className="flex items-center">
        <div className={`h-2 w-2 rounded-full bg-${color}-500 mr-1.5`}></div>
        <span className={`text-sm ${colorClass}`}>Online</span>
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
