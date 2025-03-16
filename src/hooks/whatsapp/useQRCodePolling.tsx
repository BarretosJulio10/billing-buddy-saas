
import { useState, useEffect } from "react";
import { messagingUtils } from "@/utils/messaging";
import { WhatsAppInstance } from "@/utils/messaging";

export function useQRCodePolling(
  instance: WhatsAppInstance | null,
  isActive: boolean
) {
  const [polling, setPolling] = useState(false);

  // Fetch QR code helper function
  const fetchQRCode = async () => {
    if (!instance?.instanceName) return;
    
    try {
      console.log("Fetching QR code for instance:", instance.instanceName);
      const qrResult = await messagingUtils.getWhatsAppQR(instance.instanceName);
      console.log("QR code result:", qrResult);
      
      return qrResult;
    } catch (error) {
      console.error("Error fetching QR code:", error);
      return null;
    }
  };

  // Set up polling for QR code updates when connecting
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && instance?.status === 'connecting') {
      setPolling(true);
      interval = setInterval(() => {
        fetchQRCode();
      }, 10000); // Poll every 10 seconds
    } else {
      setPolling(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, instance?.status]);

  return {
    polling,
    fetchQRCode
  };
}
