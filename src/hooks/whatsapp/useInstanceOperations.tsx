
import { useState } from "react";
import { messagingUtils } from "@/utils/messaging";
import { useToast } from "@/components/ui/use-toast";

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
      console.log(`Tentando criar instância ${instanceName} para organização ${organizationId}`);
      
      // Primeiro, salvar as configurações no banco de dados
      const saveResult = await messagingUtils.saveWhatsAppInstanceSettings(
        organizationId, 
        instanceName
      );
      
      if (!saveResult.success) {
        throw new Error(saveResult.message || "Não foi possível salvar as configurações");
      }
      
      console.log("Configurações salvas com sucesso, criando instância na Evolution API");
      
      // Depois, criar a instância na Evolution API
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
      console.error("Erro ao criar instância WhatsApp:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar instância";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
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
      console.log("Solicitando QR code para instância:", instanceName);
      const qrResult = await messagingUtils.getWhatsAppQR(instanceName);
      
      if (!qrResult.success) {
        toast({
          title: "Erro ao obter QR Code",
          description: qrResult.message || "Não foi possível obter o QR code para conexão",
          variant: "destructive"
        });
        setError(qrResult.message || "Não foi possível obter o QR code para conexão");
        return false;
      }
      
      if (!qrResult.qrcode) {
        toast({
          title: "Preparando QR Code",
          description: "Aguarde enquanto o QR code é gerado...",
        });
      }
      
      return qrResult.success;
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível iniciar a conexão com o WhatsApp";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
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
      console.log("Desconectando instância WhatsApp:", instanceName);
      const result = await messagingUtils.disconnectWhatsApp(instanceName);
      console.log("Resultado da desconexão:", result);
      
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
      console.error("Erro ao desconectar WhatsApp:", error);
      setError("Não foi possível desconectar o WhatsApp");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restartWhatsApp = async (instanceName: string) => {
    if (!instanceName) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Reiniciando instância WhatsApp:", instanceName);
      const result = await messagingUtils.restartWhatsAppInstance(instanceName);
      console.log("Resultado da reinicialização:", result);
      
      if (result.success) {
        toast({
          title: "WhatsApp reiniciado",
          description: "O WhatsApp foi reiniciado com sucesso",
        });
        return true;
      } else {
        setError(result.message || "Não foi possível reiniciar o WhatsApp");
        toast({
          title: "Erro ao reiniciar",
          description: result.message || "Não foi possível reiniciar o WhatsApp",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao reiniciar WhatsApp:", error);
      setError("Não foi possível reiniciar o WhatsApp");
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
    restartWhatsApp,
    setError
  };
}
