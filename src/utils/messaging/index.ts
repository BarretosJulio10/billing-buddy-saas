
/**
 * Messaging Utilities
 * 
 * Provides functions for sending messages through different channels.
 */

export * from './types';
export * from './whatsAppUtils';
export * from './telegramUtils';

import { whatsAppUtils } from './whatsAppUtils';
import { telegramUtils } from './telegramUtils';
import { 
  WhatsAppInstance,
  InstanceSettingsResult,
  InstanceActionResult,
  ConnectionResult,
  QRCodeResult,
  MessageSendResult
} from './types';

export const messagingUtils = {
  // WhatsApp instance management
  saveWhatsAppInstanceSettings: whatsAppUtils.saveInstanceSettings,
  getWhatsAppInstanceSettings: whatsAppUtils.getInstanceSettings,
  createWhatsAppInstance: whatsAppUtils.createInstance,
  getWhatsAppQR: whatsAppUtils.getQRCode,
  checkWhatsAppConnection: whatsAppUtils.checkConnection,
  disconnectWhatsApp: whatsAppUtils.disconnect,
  deleteWhatsAppInstance: whatsAppUtils.deleteInstance,
  
  // Message sending
  sendWhatsAppMessage: whatsAppUtils.sendMessage,
  sendTelegramMessage: telegramUtils.sendMessage
};
