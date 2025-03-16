
import { useState } from "react";
import { messagingUtils } from "@/utils/messaging";
import { WhatsAppInstance } from "@/utils/messaging";

export function useInstanceStatus() {
  const [refreshing, setRefreshing] = useState(false);
  
  const checkInstanceStatus = async (organizationId: string | undefined) => {
    if (!organizationId) {
      return {
        success: false,
        error: "ID da organização não disponível. Por favor, recarregue a página."
      };
    }
    
    try {
      setRefreshing(true);
      
      // First check if there's a stored instance name for this organization
      const instanceSettings = await messagingUtils.getWhatsAppInstanceSettings(organizationId);
      console.log("Instance settings:", instanceSettings);
      
      if (instanceSettings.success && instanceSettings.instanceName) {
        const instanceName = instanceSettings.instanceName;
        
        // Now check the connection status for this instance
        const connectionResult = await messagingUtils.checkWhatsAppConnection(instanceName);
        console.log("Connection result:", connectionResult);
        
        if (connectionResult.success) {
          const instance: WhatsAppInstance = {
            instanceName,
            status: connectionResult.connected ? 'connected' : 'disconnected',
            number: connectionResult.number
          };
          
          const step = connectionResult.connected ? 'connected' : 'connect';
          
          return {
            success: true,
            instance,
            step,
            needsQRCode: step === 'connect'
          };
        } else {
          // Instance might not exist
          return {
            success: false,
            step: 'create',
            instance: null
          };
        }
      } else {
        // No instance configured
        return {
          success: false,
          step: 'create', 
          instance: null
        };
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
      return {
        success: false,
        error: "Não foi possível verificar o status da conexão com WhatsApp",
        step: 'check'
      };
    } finally {
      setRefreshing(false);
    }
  };

  return {
    refreshing,
    checkInstanceStatus
  };
}
