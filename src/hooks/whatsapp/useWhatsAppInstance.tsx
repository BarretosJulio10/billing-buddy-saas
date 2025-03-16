
import { useState, useEffect, useCallback } from "react";
import { WhatsAppInstance } from "@/utils/messaging";
import { useQRCodePolling } from "./useQRCodePolling";
import { useInstanceOperations } from "./useInstanceOperations";
import { useInstanceStatus } from "./useInstanceStatus";
import { useToast } from "@/components/ui/use-toast";

export function useWhatsAppInstance(organizationId: string | undefined) {
  const { toast } = useToast();
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [qrPollingActive, setQrPollingActive] = useState(false);
  const [step, setStep] = useState<'check' | 'create' | 'connect' | 'connected'>('check');
  const [isInstanceSaved, setIsInstanceSaved] = useState(false);

  const { loading, error, createInstance, connectWhatsApp, disconnectWhatsApp, setError } = 
    useInstanceOperations(organizationId);
  const { refreshing, checkInstanceStatus } = useInstanceStatus();
  const { polling, fetchQRCode } = useQRCodePolling(instance, qrPollingActive);

  // Initial check on hook mount
  useEffect(() => {
    if (organizationId) {
      refreshStatus();
    } else {
      setError("ID da organização não disponível. Por favor, recarregue a página.");
    }
  }, [organizationId]);

  // Poll for status when connecting
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (qrPollingActive && instance?.status === 'connecting') {
      interval = setInterval(() => {
        refreshStatus();
      }, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrPollingActive, instance?.status]);

  const refreshStatus = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      console.log("Verificando status da instância WhatsApp...");
      const result = await checkInstanceStatus(organizationId);
      console.log("Resultado da verificação de status:", result);
      
      if (result.success && result.instance) {
        setInstance(result.instance);
        setStep(result.step as 'connect' | 'connected');
        setIsInstanceSaved(true);
        
        if (result.needsQRCode) {
          console.log("Precisa obter QR code...");
          // Corrigido: Removido o argumento passado para fetchQRCode
          const qrResult = await fetchQRCode();
          console.log("Resultado do QR code:", qrResult);
          
          if (qrResult?.success && qrResult.qrcode) {
            setInstance(prev => prev ? { 
              ...prev, 
              qrCode: qrResult.qrcode, 
              status: 'connecting' 
            } : null);
            setQrPollingActive(true);
          } else {
            toast({
              title: "Atenção",
              description: "QR code não está disponível no momento. Tente novamente em alguns instantes.",
              variant: "default"
            });
          }
        } else {
          setQrPollingActive(false);
        }
      } else {
        if (result.error) {
          setError(result.error);
        }
        setStep(result.step as 'check' | 'create' | 'connect' | 'connected');
        
        if (result.step === 'create') {
          setInstance(null);
          setIsInstanceSaved(false);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status do WhatsApp:", error);
      toast({
        title: "Erro",
        description: "Falha ao verificar o status do WhatsApp. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  }, [organizationId, checkInstanceStatus, fetchQRCode, setError, toast]);

  const handleCreateInstance = async (instanceName: string) => {
    console.log("Criando instância:", instanceName);
    const result = await createInstance(instanceName);
    
    if (result.success) {
      setInstance({
        instanceName: instanceName,
        status: 'disconnected'
      });
      
      setIsInstanceSaved(true);
      setStep('connect');
      
      toast({
        title: "Instância criada",
        description: "Instância criada com sucesso. Agora você pode conectar o WhatsApp.",
      });
    }
    
    return result;
  };

  const handleConnectWhatsApp = async () => {
    if (!instance?.instanceName) {
      setError("Nome da instância não disponível");
      return;
    }
    
    console.log("Conectando WhatsApp para instância:", instance.instanceName);
    const success = await connectWhatsApp(instance.instanceName);
    
    if (success) {
      // Corrigido: Removido o argumento passado para fetchQRCode
      const qrResult = await fetchQRCode();
      console.log("Resultado do QR code na conexão:", qrResult);
      
      if (qrResult?.success && qrResult.qrcode) {
        setInstance(prev => prev ? { 
          ...prev, 
          qrCode: qrResult.qrcode, 
          status: 'connecting' 
        } : null);
        
        setQrPollingActive(true);
        setStep('connect');
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR code com seu WhatsApp para conectar.",
        });
      } else {
        toast({
          title: "Problema ao gerar QR Code",
          description: qrResult?.message || "Não foi possível gerar o QR code. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!instance?.instanceName) return;
    
    const success = await disconnectWhatsApp(instance.instanceName);
    
    if (success) {
      setInstance({
        ...instance,
        status: 'disconnected',
        qrCode: undefined
      });
      
      setQrPollingActive(false);
      setStep('connect');
      
      toast({
        title: "WhatsApp desconectado",
        description: "WhatsApp desconectado com sucesso.",
      });
    }
  };

  return {
    loading,
    refreshing,
    instance,
    error,
    step,
    isInstanceSaved,
    createInstance: handleCreateInstance,
    connectWhatsApp: handleConnectWhatsApp,
    disconnectWhatsApp: handleDisconnectWhatsApp,
    refreshStatus,
  };
}
