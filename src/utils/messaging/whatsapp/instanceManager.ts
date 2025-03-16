
/**
 * WhatsApp Instance Manager
 * 
 * Functions for managing WhatsApp instances
 */

import { ConnectionResult, EvolutionAPIResponse, InstanceActionResult, QRCodeResult } from "../types";
import { EVOLUTION_API_KEY, EVOLUTION_API_URL } from "./config";

export const instanceManager = {
  async createInstance(
    instanceName: string,
    organizationId: string
  ): Promise<InstanceActionResult> {
    try {
      console.log(`Criando instância WhatsApp ${instanceName} para org ${organizationId}`);
      
      const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          instanceName,
          token: organizationId,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS", // Especificando o tipo de integração
          webhook: {
            url: '',
            enabled: false,
          },
          // Baseado na documentação da Evolution API
          settings: {
            rejectCall: true,
            msgMaxChars: 1000,
            sendMsgDelay: 1500,
            disableReadReceipts: false,
            disableTyping: false,
          }
        })
      });
      
      const data: EvolutionAPIResponse = await response.json();
      console.log("Resposta da criação da instância:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao criar instância do WhatsApp');
      }
      
      return {
        success: true,
        message: 'Instância WhatsApp criada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar instância WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },
  
  async getQRCode(
    instanceName: string
  ): Promise<QRCodeResult> {
    try {
      console.log("Buscando QR code para instância:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}?image=true`, {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data: EvolutionAPIResponse = await response.json();
      console.log("Resposta do QR code:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao obter QR code');
      }
      
      if (!data.success) {
        return {
          success: false,
          message: data.message || 'QR code não disponível'
        };
      }
      
      return {
        success: true,
        qrcode: data.qrcode
      };
    } catch (error) {
      console.error('Erro ao obter QR code do WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },
  
  async checkConnection(
    instanceName: string
  ): Promise<ConnectionResult> {
    try {
      console.log("Verificando conexão para instância:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data: EvolutionAPIResponse = await response.json();
      console.log("Resposta do estado da conexão:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao verificar conexão');
      }
      
      // Os estados de conexão de acordo com a Evolution API
      const isConnected = data.state === 'open';
      
      return {
        success: true,
        connected: isConnected,
        number: data.number
      };
    } catch (error) {
      console.error('Erro ao verificar conexão WhatsApp:', error);
      return {
        success: false,
        connected: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },
  
  async disconnect(
    instanceName: string
  ): Promise<InstanceActionResult> {
    try {
      console.log("Desconectando instância:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data: EvolutionAPIResponse = await response.json();
      console.log("Resposta da desconexão:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao desconectar WhatsApp');
      }
      
      return {
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },
  
  async deleteInstance(
    instanceName: string
  ): Promise<InstanceActionResult> {
    try {
      console.log("Excluindo instância:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data: EvolutionAPIResponse = await response.json();
      console.log("Resposta da exclusão da instância:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao excluir instância do WhatsApp');
      }
      
      return {
        success: true,
        message: 'Instância do WhatsApp excluída com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir instância do WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },
  
  async restartInstance(
    instanceName: string
  ): Promise<InstanceActionResult> {
    try {
      console.log("Reiniciando instância:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/restart/${instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data: EvolutionAPIResponse = await response.json();
      console.log("Resposta da reinicialização:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao reiniciar instância do WhatsApp');
      }
      
      return {
        success: true,
        message: 'Instância do WhatsApp reiniciada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao reiniciar instância do WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
};
