/**
 * Messaging Cron Utility
 * 
 * This utility is responsible for scheduling and sending messages based on collection rules.
 * It would typically be run on a server as a cron job, but for demonstration purposes,
 * it can be triggered manually or simulated in the frontend.
 */

import { messageHistoryApi } from '../api/messageHistoryApi';
import { messagingSettingsApi } from '../api/messagingSettingsApi';
import { createMessageFromTemplate } from './messageTemplates';
import { messagingUtils } from './messaging';

// Simulated function to run the cron job
export const runMessagingCron = async (organizationId: string) => {
  try {
    // In a real system, this would be an RPC call to a stored procedure
    // that returns pending messages
    const pendingMessages = [
      {
        invoice_id: '1',
        customer_id: '1',
        customer_name: 'João Silva',
        customer_phone: '5511999999999',
        message_type: 'reminder',
        template_text: 'Olá {cliente}, sua fatura de {valor} vence em {dias_para_vencer} dias.',
        payment_link: 'https://example.com/pay/123',
        amount: 199.99,
        days_to_due: 3,
        days_overdue: null
      },
      {
        invoice_id: '2',
        customer_id: '2',
        customer_name: 'Maria Oliveira',
        customer_phone: '5511888888888',
        message_type: 'overdue',
        template_text: 'Olá {cliente}, sua fatura de {valor} está atrasada há {dias_atraso} dias. Link: {link}',
        payment_link: 'https://example.com/pay/456',
        amount: 350.50,
        days_to_due: null,
        days_overdue: 5
      }
    ];

    console.log(`Found ${pendingMessages.length} pending messages to send`);

    // Get messaging settings
    const whatsappSettings = await messagingSettingsApi.getByChannel('whatsapp');
    const telegramSettings = await messagingSettingsApi.getByChannel('telegram');

    // Get the WhatsApp instance name for the organization
    const whatsappInstanceName = `org_${organizationId}`;

    // Check if WhatsApp is connected for this organization
    let whatsappConnected = false;
    if (whatsappSettings && whatsappSettings.is_active) {
      const connectionStatus = await messagingUtils.checkWhatsAppConnection(whatsappInstanceName);
      whatsappConnected = connectionStatus.connected;
    }

    // Process each pending message
    for (const pendingMessage of pendingMessages) {
      // Format the message with template variables
      const messageText = createMessageFromTemplate(
        pendingMessage.template_text,
        {
          customerName: pendingMessage.customer_name,
          amount: pendingMessage.amount,
          daysUntilDue: pendingMessage.days_to_due || undefined,
          daysOverdue: pendingMessage.days_overdue || undefined,
          paymentLink: pendingMessage.payment_link
        }
      );

      console.log(`Formatted message: ${messageText}`);

      // Determine which channel to use (in this example, always try WhatsApp first, then Telegram)
      let sendResult = null;
      let channel = '';
      let error = null;

      // Try WhatsApp if configured and connected
      if (whatsappSettings && whatsappSettings.is_active && whatsappConnected) {
        try {
          channel = 'whatsapp';
          sendResult = await messagingUtils.sendWhatsAppMessage(
            pendingMessage.customer_phone,
            messageText,
            whatsappInstanceName
          );
          console.log('WhatsApp message sent successfully');
        } catch (err) {
          console.error('Error sending WhatsApp message:', err);
          error = err instanceof Error ? err.message : 'Unknown error';
          // Fall back to Telegram
        }
      }

      // Try Telegram if WhatsApp failed or is not configured
      if (!sendResult && telegramSettings && telegramSettings.is_active) {
        try {
          channel = 'telegram';
          // In a real system, you'd need to have the customer's Telegram chat ID
          const chatId = telegramSettings.additional_config?.chat_id || '';
          if (chatId) {
            sendResult = await messagingUtils.sendTelegramMessage(
              chatId,
              messageText
            );
            console.log('Telegram message sent successfully');
          } else {
            throw new Error('No Telegram chat ID configured');
          }
        } catch (err) {
          console.error('Error sending Telegram message:', err);
          error = err instanceof Error ? err.message : 'Unknown error';
        }
      }

      // Log the message attempt to message_history
      await messageHistoryApi.create({
        customer_id: pendingMessage.customer_id,
        invoice_id: pendingMessage.invoice_id,
        message_type: pendingMessage.message_type as any,
        channel: channel as any,
        content: messageText,
        status: sendResult ? 'sent' : 'failed',
        sent_at: sendResult ? new Date().toISOString() : undefined,
        error_message: error || undefined
      });
    }

    return {
      success: true,
      messagesProcessed: pendingMessages.length
    };
  } catch (error) {
    console.error('Error running messaging cron:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to test messaging configuration
export const testMessagingConfiguration = async (
  channel: 'whatsapp' | 'telegram',
  recipient: string,
  message: string,
  organizationId: string
) => {
  try {
    let result;
    
    if (channel === 'whatsapp') {
      const instanceName = `org_${organizationId}`;
      result = await messagingUtils.sendWhatsAppMessage(recipient, message, instanceName);
    } else if (channel === 'telegram') {
      result = await messagingUtils.sendTelegramMessage(recipient, message);
    } else {
      throw new Error(`Unsupported channel: ${channel}`);
    }
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error(`Error testing ${channel} configuration:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
