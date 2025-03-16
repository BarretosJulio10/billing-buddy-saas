
/**
 * WhatsApp Modules Index
 * 
 * Re-exports all WhatsApp-related utilities
 */

import { instanceManager } from './instanceManager';
import { messageService } from './messageService';
import { settingsManager } from './settingsManager';

export const whatsAppUtils = {
  // Settings storage in database
  saveInstanceSettings: settingsManager.saveInstanceSettings,
  getInstanceSettings: settingsManager.getInstanceSettings,
  
  // Message sending
  sendMessage: messageService.sendMessage,
  
  // Evolution API WhatsApp instance management
  createInstance: instanceManager.createInstance,
  getQRCode: instanceManager.getQRCode,
  checkConnection: instanceManager.checkConnection,
  disconnect: instanceManager.disconnect,
  deleteInstance: instanceManager.deleteInstance
};
