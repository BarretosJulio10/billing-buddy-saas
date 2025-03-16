
/**
 * WhatsApp Modules Index
 * 
 * Re-exports all WhatsApp-related utilities
 */

import { instanceManager } from './instanceManager';
import { messageService } from './messageService';
import { settingsManager } from './settingsManager';

export const whatsAppUtils = {
  // Armazenamento de configurações no banco de dados
  saveInstanceSettings: settingsManager.saveInstanceSettings,
  getInstanceSettings: settingsManager.getInstanceSettings,
  
  // Envio de mensagens
  sendMessage: messageService.sendMessage,
  sendTemplate: messageService.sendTemplate,
  
  // Gerenciamento de instâncias da Evolution API WhatsApp
  createInstance: instanceManager.createInstance,
  getQRCode: instanceManager.getQRCode,
  checkConnection: instanceManager.checkConnection,
  disconnect: instanceManager.disconnect,
  deleteInstance: instanceManager.deleteInstance,
  restartInstance: instanceManager.restartInstance
};
