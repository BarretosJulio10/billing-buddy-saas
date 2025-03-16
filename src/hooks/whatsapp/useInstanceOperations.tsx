
import { useState } from "react";
import { messagingUtils } from "@/utils/messaging";
import { useToast } from "@/components/ui/use-toast";
import { WhatsAppInstance } from "@/utils/messaging";

export function useInstanceOperations(organizationId: string | undefined) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        return { success: true, instanceName };
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

  const connectWhatsApp = async (instanceName: string) => {
    if (!instanceName) {
      setError("Nome da instância não disponível");
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const qrResult = await messagingUtils.getWhatsAppQR(instanceName);
      
      if (!qrResult.qrcode) {
        toast({
          title: "Preparando QR Code",
          description: "Aguarde enquanto o QR code é gerado...",
        });
      }
      
      return qrResult.success;
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      setError("Não foi possível iniciar a conexão com o WhatsApp");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWhatsApp = async (instanceName: string) => {
    if (!instanceName) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Disconnecting WhatsApp instance:", instanceName);
      const result = await messagingUtils.disconnectWhatsApp(instanceName);
      console.log("Disconnect result:", result);
      
      if (result.success) {
        toast({
          title: "WhatsApp desconectado",
          description: "O WhatsApp foi desconectado com sucesso",
        });
        return true;
      } else {
        setError(result.message || "Não foi possível desconectar o WhatsApp");
        toast({
          title: "Erro ao desconectar",
          description: result.message || "Não foi possível desconectar o WhatsApp",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      setError("Não foi possível desconectar o WhatsApp");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createInstance,
    connectWhatsApp,
    disconnectWhatsApp,
    setError
  };
}
