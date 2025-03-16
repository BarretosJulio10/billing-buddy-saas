
/**
 * Messaging Types
 * 
 * Shared types for messaging functionality
 */

export interface WhatsAppInstance {
  instanceName: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrCode?: string;
  number?: string;
}

export interface MessageSendResult {
  success: boolean;
  messageId?: string;
  message?: string;
}

export interface InstanceSettingsResult {
  success: boolean;
  instanceName?: string;
  message?: string;
}

export interface QRCodeResult {
  success: boolean;
  qrcode?: string;
  message?: string;
}

export interface ConnectionResult {
  success: boolean;
  connected: boolean;
  number?: string;
  message?: string;
}

export interface InstanceActionResult {
  success: boolean;
  message?: string;
}
