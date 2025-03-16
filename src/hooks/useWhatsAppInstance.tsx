
import { useState, useEffect } from "react";
import { messagingUtils, WhatsAppInstance } from "@/utils/messagingUtils";
import { useToast } from "@/components/ui/use-toast";

export function useWhatsAppInstance(organizationId: string | undefined) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [qrPollingActive, setQrPollingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'check' | 'create' | 'connect' | 'connected'>('check');

  const checkInstanceStatus = async () => {
    if (!organizationId) {
      setError("ID da organização não disponível. Por favor, recarregue a página.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First check if there's a stored instance name for this organization
      const instanceSettings = await messagingUtils.getWhatsAppInstanceSettings(organizationId);
      console.log("Instance settings:", instanceSettings);
      
      if (instanceSettings.success && instanceSettings.instanceName) {
        const instanceName = instanceSettings.instanceName;
        
        // Now check the connection status for this instance
        const connectionResult = await messagingUtils.checkWhatsAppConnection(instanceName);
        console.log("Connection result:", connectionResult);
        
        if (connectionResult.success) {
          setInstance({
            instanceName,
            status: connectionResult.connected ? 'connected' : 'disconnected',
            number: connectionResult.number
          });
          
          if (connectionResult.connected) {
            setStep('connected');
            setQrPollingActive(false);
          } else {
            setStep('connect');
            // If not connected, try to get the QR code
            await fetchQRCode();
          }
        } else {
          // Instance might not exist, set to create state
          setStep('create');
          setInstance(null);
        }
      } else {
        // No instance configured, go to create step
        setStep('create');
        setInstance(null);
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
      setError("Não foi possível verificar o status da conexão com WhatsApp");
      setStep('check');
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    if (!instance?.instanceName) return;
    
    try {
      console.log("Fetching QR code for instance:", instance.instanceName);
      const qrResult = await messagingUtils.getWhatsAppQR(instance.instanceName);
      console.log("QR code result:", qrResult);
      
      if (qrResult.success && qrResult.qrcode) {
        setInstance(prev => prev ? { ...prev, qrCode: qrResult.qrcode, status: 'connecting' } : null);
        setQrPollingActive(true);
        setStep('connect');
      } else if (qrResult.message) {
        console.log("QR code not available:", qrResult.message);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };

  const createInstance = async (instanceName: string) => {
    if (!organizationId) {
      setError("ID da organização não disponível. Por favor, recarregue a página.");
      return { success: false };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Save the instance name to the database first
      const saveResult = await messagingUtils.saveWhatsAppInstanceSettings(
        organizationId, 
        instanceName
      );
      
      if (!saveResult.success) {
        throw new Error(saveResult.message || "Não foi possível salvar as configurações");
      }
      
      // Now create the instance with Evolution API
      const createResult = await messagingUtils.createWhatsAppInstance(
        instanceName, 
        organizationId
      );
      
      if (createResult.success) {
        toast({
          title: "Instância criada",
          description: "Instância do WhatsApp criada com sucesso. Agora você pode conectar.",
        });
        
        setInstance({
          instanceName: instanceName,
          status: 'disconnected'
        });
        
        setStep('connect');
        return { success: true };
      } else {
        setError(createResult.message || "Não foi possível criar a instância");
        toast({
          title: "Erro ao criar instância",
          description: createResult.message || "Não foi possível criar a instância",
          variant: "destructive"
        });
        return { success: false };
      }
    } catch (error) {
      console.error("Error creating WhatsApp instance:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar instância");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const connectWhatsApp = async () => {
    if (!instance?.instanceName) {
      setError("Nome da instância não disponível");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Just fetch QR code for the already created instance
      await fetchQRCode();
      
      if (!instance.qrCode) {
        toast({
          title: "Preparando QR Code",
          description: "Aguarde enquanto o QR code é gerado...",
        });
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      setError("Não foi possível iniciar a conexão com o WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    if (!instance?.instanceName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Disconnecting WhatsApp instance:", instance.instanceName);
      const result = await messagingUtils.disconnectWhatsApp(instance.instanceName);
      console.log("Disconnect result:", result);
      
      if (result.success) {
        setInstance({
          ...instance,
          status: 'disconnected',
          qrCode: undefined
        });
        
        setQrPollingActive(false);
        setStep('connect');
        
        toast({
          title: "WhatsApp desconectado",
          description: "O WhatsApp foi desconectado com sucesso",
        });
      } else {
        setError(result.message || "Não foi possível desconectar o WhatsApp");
        toast({
          title: "Erro ao desconectar",
          description: result.message || "Não foi possível desconectar o WhatsApp",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      setError("Não foi possível desconectar o WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setRefreshing(true);
    setError(null);
    await checkInstanceStatus();
    setRefreshing(false);
  };

  // Initial check on hook mount
  useEffect(() => {
    if (organizationId) {
      checkInstanceStatus();
    } else {
      setError("ID da organização não disponível. Por favor, recarregue a página.");
    }
  }, [organizationId]);

  // Poll for QR code updates when connecting
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
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

  return {
    loading,
    refreshing,
    instance,
    error,
    step,
    createInstance,
    connectWhatsApp,
    disconnectWhatsApp,
    refreshStatus,
  };
}
