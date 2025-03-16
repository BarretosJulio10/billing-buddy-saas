
import { useState, useEffect } from "react";
import { WhatsAppInstance } from "@/utils/messaging";
import { useQRCodePolling } from "./useQRCodePolling";
import { useInstanceOperations } from "./useInstanceOperations";
import { useInstanceStatus } from "./useInstanceStatus";

export function useWhatsAppInstance(organizationId: string | undefined) {
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

  const handleCreateInstance = async (instanceName: string) => {
    const result = await createInstance(instanceName);
    
    if (result.success) {
      setInstance({
        instanceName: instanceName,
        status: 'disconnected'
      });
      
      setIsInstanceSaved(true);
      setStep('connect');
    }
    
    return result;
  };

  const handleConnectWhatsApp = async () => {
    if (!instance?.instanceName) {
      setError("Nome da instância não disponível");
      return;
    }
    
    const success = await connectWhatsApp(instance.instanceName);
    
    if (success) {
      const qrResult = await fetchQRCode();
      
      if (qrResult?.success && qrResult.qrcode) {
        setInstance(prev => prev ? { 
          ...prev, 
          qrCode: qrResult.qrcode, 
          status: 'connecting' 
        } : null);
        
        setQrPollingActive(true);
        setStep('connect');
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
    }
  };

  const refreshStatus = async () => {
    if (!organizationId) return;
    
    const result = await checkInstanceStatus(organizationId);
    
    if (result.success && result.instance) {
      setInstance(result.instance);
      setStep(result.step as 'connect' | 'connected');
      setIsInstanceSaved(true);
      
      if (result.needsQRCode) {
        const qrResult = await fetchQRCode();
        if (qrResult?.success && qrResult.qrcode) {
          setInstance(prev => prev ? { 
            ...prev, 
            qrCode: qrResult.qrcode, 
            status: 'connecting' 
          } : null);
          setQrPollingActive(true);
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
