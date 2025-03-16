
import { useState } from "react";
import { messagingUtils } from "@/utils/messaging";
import { WhatsAppInstance } from "@/utils/messaging";
import { toast } from "@/components/ui/use-toast";

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
      
      // Primeiro verificar se há um nome de instância armazenado para esta organização
      const instanceSettings = await messagingUtils.getWhatsAppInstanceSettings(organizationId);
      console.log("Configurações da instância:", instanceSettings);
      
      if (instanceSettings.success && instanceSettings.instanceName) {
        const instanceName = instanceSettings.instanceName;
        
        // Agora verificar o estado da conexão para esta instância
        const connectionResult = await messagingUtils.checkWhatsAppConnection(instanceName);
        console.log("Resultado da conexão:", connectionResult);
        
        if (connectionResult.success) {
          const instance: WhatsAppInstance = {
            instanceName,
            status: connectionResult.connected ? 'connected' : 'disconnected',
            number: connectionResult.number
          };
          
          const step = connectionResult.connected ? 'connected' : 'connect';
          
          // Se a conexão não for bem-sucedida e houver uma mensagem de erro específica
          // que indica que a instância não existe, devemos retornar para o estado 'create'
          if (!connectionResult.connected && 
              connectionResult.message && 
              (connectionResult.message.includes('not exist') || 
               connectionResult.message.includes('não existe'))) {
            return {
              success: false,
              step: 'create',
              instance: null,
              error: 'A instância não existe mais. Por favor, crie uma nova.'
            };
          }
          
          return {
            success: true,
            instance,
            step,
            needsQRCode: step === 'connect'
          };
        } else if (connectionResult.message && 
                  (connectionResult.message.includes('not exist') || 
                   connectionResult.message.includes('não existe'))) {
          // Instância pode não existir mais
          toast({
            title: "Instância não encontrada",
            description: "A instância WhatsApp não foi encontrada. É necessário criar uma nova.",
            variant: "destructive"
          });
          
          return {
            success: false,
            step: 'create',
            instance: null
          };
        } else {
          // Erro ao verificar conexão
          toast({
            title: "Erro de conexão",
            description: connectionResult.message || "Não foi possível verificar o status da conexão.",
            variant: "destructive"
          });
          
          return {
            success: false,
            step: 'connect', 
            instance: {
              instanceName,
              status: 'disconnected'
            },
            error: connectionResult.message
          };
        }
      } else {
        // Nenhuma instância configurada
        return {
          success: false,
          step: 'create', 
          instance: null
        };
      }
    } catch (error) {
      console.error("Erro ao verificar status do WhatsApp:", error);
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
