
/**
 * Messaging Utilities
 * 
 * Provides functions for sending messages through different channels.
 */

// Evolution API Configuration
const EVOLUTION_API_URL = "https://evolution.pagoupix.com.br";
const EVOLUTION_API_KEY = "f4605620efebc20566233aae05d9ed39";

import { supabase } from "@/integrations/supabase/client";

export interface WhatsAppInstance {
  instanceName: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
  number?: string;
}

export const messagingUtils = {
  // WhatsApp instance settings storage in database
  async saveWhatsAppInstanceSettings(
    organizationId: string,
    instanceName: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if there's an existing entry
      const { data: existingSettings } = await supabase
        .from('messaging_settings')
        .select()
        .eq('organization_id', organizationId)
        .eq('channel', 'whatsapp')
        .maybeSingle();
      
      if (existingSettings) {
        // Update existing entry
        const { error } = await supabase
          .from('messaging_settings')
          .update({
            additional_config: { instanceName },
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);
        
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('messaging_settings')
          .insert({
            organization_id: organizationId,
            channel: 'whatsapp',
            is_active: true,
            additional_config: { instanceName }
          });
        
        if (error) throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error saving WhatsApp instance settings:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  async getWhatsAppInstanceSettings(
    organizationId: string
  ): Promise<{ success: boolean; instanceName?: string; message?: string }> {
    try {
      const { data, error } = await supabase
        .from('messaging_settings')
        .select()
        .eq('organization_id', organizationId)
        .eq('channel', 'whatsapp')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.additional_config) {
        // Fix type issues by handling additional_config properly
        const config = data.additional_config as Record<string, any>;
        if (config.instanceName) {
          return {
            success: true,
            instanceName: config.instanceName as string
          };
        }
      }
      
      return {
        success: false,
        message: 'Nenhuma instância configurada'
      };
    } catch (error) {
      console.error('Error getting WhatsApp instance settings:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async sendWhatsAppMessage(
    phoneNumber: string,
    message: string,
    instanceName: string
  ): Promise<{ success: boolean; messageId?: string }> {
    console.log(`Sending WhatsApp message to ${phoneNumber} via ${instanceName}:`, message);
    
    try {
      // Format phone number (remove any non-numeric characters)
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // Call Evolution API to send message
      const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: formattedPhone,
          options: {
            delay: 1200
          },
          textMessage: {
            text: message
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send WhatsApp message');
      }
      
      return {
        success: true,
        messageId: data.key?.id || `whatsapp_${Date.now()}`
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false
      };
    }
  },
  
  async sendTelegramMessage(
    chatId: string,
    message: string
  ): Promise<{ success: boolean;  messageId?: string }> {
    console.log(`Sending Telegram message to chat ${chatId}:`, message);
    
    // In a real implementation, this would call the Telegram API
    // For now, we'll simulate a successful send
    return {
      success: true,
      messageId: `telegram_${Date.now()}`
    };
  },
  
  // Evolution API WhatsApp instance management
  async createWhatsAppInstance(
    instanceName: string,
    organizationId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(`Creating WhatsApp instance ${instanceName} for org ${organizationId}`);
      
      const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          instanceName,
          token: organizationId,
          qrcode: true
        })
      });
      
      const data = await response.json();
      console.log("Create instance response:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create WhatsApp instance');
      }
      
      return {
        success: true,
        message: 'WhatsApp instance created successfully'
      };
    } catch (error) {
      console.error('Error creating WhatsApp instance:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  async getWhatsAppQR(
    instanceName: string
  ): Promise<{ success: boolean; qrcode?: string; message?: string }> {
    try {
      console.log("Fetching QR code for instance:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}?image=true`, {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data = await response.json();
      console.log("QR code response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get QR code');
      }
      
      if (!data.success) {
        return {
          success: false,
          message: data.message || 'QR code not available'
        };
      }
      
      return {
        success: true,
        qrcode: data.qrcode
      };
    } catch (error) {
      console.error('Error getting WhatsApp QR code:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  async checkWhatsAppConnection(
    instanceName: string
  ): Promise<{ success: boolean; connected: boolean; number?: string }> {
    try {
      console.log("Checking connection for instance:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data = await response.json();
      console.log("Connection state response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check connection');
      }
      
      // The connection states according to Evolution API
      const isConnected = data.state === 'open';
      
      return {
        success: true,
        connected: isConnected,
        number: data.number
      };
    } catch (error) {
      console.error('Error checking WhatsApp connection:', error);
      return {
        success: false,
        connected: false
      };
    }
  },
  
  async disconnectWhatsApp(
    instanceName: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log("Disconnecting instance:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data = await response.json();
      console.log("Disconnect response:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to disconnect WhatsApp');
      }
      
      return {
        success: true,
        message: 'WhatsApp disconnected successfully'
      };
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  async deleteWhatsAppInstance(
    instanceName: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      console.log("Deleting instance:", instanceName);
      const response = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      });
      
      const data = await response.json();
      console.log("Delete instance response:", data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete WhatsApp instance');
      }
      
      return {
        success: true,
        message: 'WhatsApp instance deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting WhatsApp instance:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
