
import { useState, useEffect } from "react";
import { WhatsAppInstance } from "@/utils/messaging";
import { messagingUtils } from "@/utils/messaging";

export function useQRCodePolling(instance: WhatsAppInstance | null, active: boolean) {
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (active && instance?.instanceName) {
      setPolling(true);
      console.log("Starting QR code polling for instance:", instance.instanceName);
      
      intervalId = setInterval(async () => {
        if (instance.status === 'connected') {
          console.log("Instance is connected, stopping QR polling");
          if (intervalId) clearInterval(intervalId);
          setPolling(false);
          return;
        }
        
        console.log("Polling for QR code...");
        await fetchQRCode();
      }, 30000); // Poll every 30 seconds
    }
    
    return () => {
      if (intervalId) {
        console.log("Cleaning up QR code polling interval");
        clearInterval(intervalId);
        setPolling(false);
      }
    };
  }, [active, instance?.instanceName, instance?.status]);

  const fetchQRCode = async () => {
    if (!instance?.instanceName) return null;
    
    try {
      const result = await messagingUtils.getWhatsAppQR(instance.instanceName);
      console.log("QR code polling result:", result);
      return result;
    } catch (error) {
      console.error("Error polling for QR code:", error);
      return null;
    }
  };

  return {
    polling,
    fetchQRCode
  };
}
