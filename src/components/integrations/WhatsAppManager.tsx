
import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { messagingUtils, WhatsAppInstance } from "@/utils/messagingUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, PhoneOff, Check } from "lucide-react";

export function WhatsAppManager() {
  const { organizationId } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [qrPollingActive, setQrPollingActive] = useState(false);
  const instanceName = `org_${organizationId}`;

  useEffect(() => {
    if (organizationId) {
      checkInstanceStatus();
    }
  }, [organizationId]);

  // Poll for QR code updates when connecting
  useEffect(() => {
    let interval: any = null;
    
    if (qrPollingActive && instance?.status === 'connecting') {
      interval = setInterval(() => {
        fetchQRCode();
        checkInstanceStatus();
      }, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrPollingActive, instance?.status]);

  const checkInstanceStatus = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const connectionResult = await messagingUtils.checkWhatsAppConnection(instanceName);
      
      if (connectionResult.success) {
        setInstance({
          instanceName,
          status: connectionResult.connected ? 'connected' : 'disconnected',
          number: connectionResult.number
        });
        
        if (!connectionResult.connected) {
          // If not connected, try to get the QR code
          await fetchQRCode();
        } else {
          setQrPollingActive(false);
        }
      } else {
        // Instance might not exist, try to create it
        setInstance({
          instanceName,
          status: 'disconnected'
        });
        
        toast({
          title: "WhatsApp não configurado",
          description: "Clique em Conectar para configurar o WhatsApp",
        });
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
      toast({
        title: "Erro ao verificar o status do WhatsApp",
        description: "Não foi possível verificar o status da conexão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    if (!organizationId) return;
    
    try {
      const qrResult = await messagingUtils.getWhatsAppQR(instanceName);
      
      if (qrResult.success && qrResult.qrcode) {
        setInstance(prev => prev ? { ...prev, qrCode: qrResult.qrcode, status: 'connecting' } : null);
        setQrPollingActive(true);
      } else {
        console.log("QR code not available:", qrResult.message);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };

  const handleConnect = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      // Create the instance if it doesn't exist
      const createResult = await messagingUtils.createWhatsAppInstance(instanceName, organizationId);
      
      if (createResult.success) {
        toast({
          title: "Iniciando conexão",
          description: "Aguarde enquanto preparamos o QR code",
        });
        
        // Fetch the QR code
        await fetchQRCode();
      } else {
        toast({
          title: "Erro ao iniciar conexão",
          description: createResult.message || "Não foi possível iniciar a conexão com o WhatsApp",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      toast({
        title: "Erro ao conectar WhatsApp",
        description: "Não foi possível iniciar a conexão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!instance) return;
    
    setLoading(true);
    try {
      const result = await messagingUtils.disconnectWhatsApp(instance.instanceName);
      
      if (result.success) {
        setInstance({
          ...instance,
          status: 'disconnected',
          qrCode: undefined
        });
        
        setQrPollingActive(false);
        
        toast({
          title: "WhatsApp desconectado",
          description: "O WhatsApp foi desconectado com sucesso",
        });
      } else {
        toast({
          title: "Erro ao desconectar",
          description: result.message || "Não foi possível desconectar o WhatsApp",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      toast({
        title: "Erro ao desconectar WhatsApp",
        description: "Não foi possível desconectar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkInstanceStatus();
    setRefreshing(false);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Conecte sua conta do WhatsApp para enviar mensagens</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {instance?.status === 'connected' && (
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
                    </div>
                  </div>
                </div>
              )}
              
              {instance?.status === 'connecting' && instance.qrCode && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
                    <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                      Escaneie o código QR com seu WhatsApp para conectar
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <img 
                        src={`data:image/png;base64,${instance.qrCode}`} 
                        alt="WhatsApp QR Code" 
                        className="w-64 h-64"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-center text-muted-foreground">
                    Abra o WhatsApp no seu telefone e escaneie o código QR acima
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2 justify-center">
                {(instance?.status === 'disconnected' || !instance) && (
                  <Button onClick={handleConnect} disabled={loading}>
                    Conectar WhatsApp
                  </Button>
                )}
                
                {instance?.status === 'connected' && (
                  <Button 
                    variant="destructive" 
                    onClick={handleDisconnect} 
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    <PhoneOff className="h-4 w-4 mr-1" />
                    Desconectar
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
