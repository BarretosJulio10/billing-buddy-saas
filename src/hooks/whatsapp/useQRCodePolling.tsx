
import { useState, useEffect, useRef, useCallback } from "react";
import { WhatsAppInstance } from "@/utils/messaging";
import { messagingUtils } from "@/utils/messaging";
import { useToast } from "@/components/ui/use-toast";

export function useQRCodePolling(instance: WhatsAppInstance | null, active: boolean) {
  const { toast } = useToast();
  const [polling, setPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 20; // Máximo de tentativas antes de desistir
  const retryCountRef = useRef(0);

  const fetchQRCode = useCallback(async () => {
    if (!instance?.instanceName) return null;
    
    try {
      const result = await messagingUtils.getWhatsAppQR(instance.instanceName);
      console.log("Resultado do polling de QR code:", result);
      
      if (!result.success && result.message) {
        toast({
          variant: "destructive",
          title: "Erro ao obter QR code",
          description: result.message
        });
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao fazer polling de QR code:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao obter o QR code. Tente novamente mais tarde."
      });
      return null;
    }
  }, [instance?.instanceName, toast]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log("Parando polling de QR code");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setPolling(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setPolling(true);
    retryCountRef.current = 0;
    console.log("Iniciando polling de QR code para instância:", instance?.instanceName);
    
    pollingIntervalRef.current = setInterval(async () => {
      if (!instance?.instanceName || instance?.status === 'connected') {
        stopPolling();
        return;
      }
      
      console.log("Verificando QR code... Tentativa:", retryCountRef.current + 1);
      await fetchQRCode();
      
      retryCountRef.current++;
      if (retryCountRef.current >= maxRetries) {
        console.log("Número máximo de tentativas atingido. Parando polling.");
        toast({
          title: "Tempo esgotado",
          description: "Não foi possível conectar o WhatsApp após várias tentativas. Tente novamente mais tarde.",
          variant: "destructive"
        });
        stopPolling();
      }
    }, 10000); // Verificar a cada 10 segundos
  }, [instance?.instanceName, instance?.status, fetchQRCode, stopPolling, toast]);

  useEffect(() => {
    if (active && instance?.instanceName) {
      startPolling();
      
      return () => {
        stopPolling();
      };
    } else {
      stopPolling();
    }
  }, [active, instance?.instanceName, instance?.status, startPolling, stopPolling]);

  return {
    polling,
    fetchQRCode,
    startPolling,
    stopPolling
  };
}
