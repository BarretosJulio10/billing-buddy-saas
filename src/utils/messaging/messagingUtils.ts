
import { supabase } from "@/integrations/supabase/client";
import { whatsAppUtils } from "./whatsapp";
import { InstanceActionResult, InstanceSettings, ConnectionResult, QRCodeResult } from "./types";

export const messagingUtils = {
  // WhatsApp Integration Helpers
  async createWhatsAppInstance(instanceName: string, organizationId: string): Promise<InstanceActionResult> {
    try {
      const response = await supabase.functions.invoke('whatsapp-connector', {
        body: {
          action: 'create',
          instanceName,
          organizationId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao criar instância WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async getWhatsAppQR(instanceName: string): Promise<QRCodeResult> {
    try {
      const response = await supabase.functions.invoke('whatsapp-connector', {
        body: {
          action: 'getQR',
          instanceName
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao obter QR code do WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async checkWhatsAppConnection(instanceName: string): Promise<ConnectionResult> {
    try {
      const response = await supabase.functions.invoke('whatsapp-connector', {
        body: {
          action: 'status',
          instanceName
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao verificar conexão do WhatsApp:', error);
      return {
        success: false,
        connected: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async disconnectWhatsApp(instanceName: string): Promise<InstanceActionResult> {
    try {
      const response = await supabase.functions.invoke('whatsapp-connector', {
        body: {
          action: 'disconnect',
          instanceName
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async getWhatsAppInstanceSettings(organizationId: string): Promise<InstanceSettings> {
    try {
      return await whatsAppUtils.getInstanceSettings(organizationId);
    } catch (error) {
      console.error('Erro ao obter configurações da instância:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async saveWhatsAppInstanceSettings(organizationId: string, instanceName: string): Promise<InstanceSettings> {
    try {
      return await whatsAppUtils.saveInstanceSettings(organizationId, instanceName);
    } catch (error) {
      console.error('Erro ao salvar configurações da instância:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },

  async restartWhatsAppInstance(instanceName: string): Promise<InstanceActionResult> {
    // Esta função pode ser implementada no futuro para reiniciar instâncias
    return {
      success: false,
      message: "Funcionalidade ainda não implementada"
    };
  }
};
