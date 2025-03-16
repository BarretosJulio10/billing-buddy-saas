
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
    console.log(`Enviando mensagem WhatsApp para ${phoneNumber} via ${instanceName}:`, message);
    
    try {
      // Formatar número de telefone (remover caracteres não numéricos)
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // Chamar a Evolution API para enviar mensagem
      const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: formattedPhone,
          options: {
            delay: 1200,
            presence: "composing" // Status "digitando..." antes de enviar
          },
          textMessage: {
            text: message
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao enviar mensagem do WhatsApp');
      }
      
      return {
        success: true,
        messageId: data.key?.id || `whatsapp_${Date.now()}`
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem do WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },
  
  async sendTemplate(
    phoneNumber: string,
    templateName: string,
    parameters: Record<string, string>,
    instanceName: string
  ): Promise<MessageSendResult> {
    console.log(`Enviando template WhatsApp para ${phoneNumber} via ${instanceName}:`, templateName);
    
    try {
      // Formatar número de telefone (remover caracteres não numéricos)
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // Chamar a Evolution API para enviar template
      const response = await fetch(`${EVOLUTION_API_URL}/message/sendTemplate/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY
        },
        body: JSON.stringify({
          number: formattedPhone,
          template: {
            name: templateName,
            language: { code: 'pt_BR' },
            components: [
              {
                type: 'body',
                parameters: Object.entries(parameters).map(([key, value]) => ({
                  type: 'text',
                  text: value
                }))
              }
            ]
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao enviar template do WhatsApp');
      }
      
      return {
        success: true,
        messageId: data.key?.id || `whatsapp_template_${Date.now()}`
      };
    } catch (error) {
      console.error('Erro ao enviar template do WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
};
