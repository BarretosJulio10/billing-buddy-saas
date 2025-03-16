
import { useState, useEffect, useRef } from "react";
import { WhatsAppInstance } from "@/utils/messaging";
import { messagingUtils } from "@/utils/messaging";

export function useQRCodePolling(instance: WhatsAppInstance | null, active: boolean) {
  const [polling, setPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 20; // Máximo de tentativas antes de desistir
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (active && instance?.instanceName) {
      startPolling();
      
      return () => {
        stopPolling();
      };
    } else {
      stopPolling();
    }
  }, [active, instance?.instanceName, instance?.status]);

  const startPolling = () => {
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
        stopPolling();
      }
    }, 10000); // Verificar a cada 10 segundos
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      console.log("Parando polling de QR code");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setPolling(false);
    }
  };

  const fetchQRCode = async () => {
    if (!instance?.instanceName) return null;
    
    try {
      const result = await messagingUtils.getWhatsAppQR(instance.instanceName);
      console.log("Resultado do polling de QR code:", result);
      return result;
    } catch (error) {
      console.error("Erro ao fazer polling de QR code:", error);
      return null;
    }
  };

  return {
    polling,
    fetchQRCode,
    startPolling,
    stopPolling
  };
}
