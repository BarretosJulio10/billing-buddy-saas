
/**
 * WhatsApp Message Service
 * 
 * Functions for sending WhatsApp messages
 */

import { MessageSendResult } from "../types";
import { EVOLUTION_API_KEY, EVOLUTION_API_URL } from "./config";

export const messageService = {
  async sendMessage(
    phoneNumber: string,
    message: string,
    instanceName: string
  ): Promise<MessageSendResult> {
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
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
