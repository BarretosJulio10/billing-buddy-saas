/**
 * Messaging Types
 * 
 * Shared types for messaging functionality
 */

export interface WhatsAppInstance {
  instanceName: string;
  status?: 'disconnected' | 'connecting' | 'connected';
  number?: string;
  qrCode?: string;
}

export interface MessageSendResult {
  success: boolean;
  messageId?: string;
  message?: string;
}

export interface InstanceSettings {
  success: boolean;
  instanceName?: string;
  status?: string;
  qrCode?: string;
  message?: string;
}

export interface InstanceActionResult {
  success: boolean;
  message?: string;
  instanceName?: string;
}

export interface ConnectionResult {
  success: boolean;
  connected: boolean;
  number?: string;
  message?: string;
}

export interface QRCodeResult {
  success: boolean;
  qrcode?: string;
  message?: string;
}

export interface EvolutionAPIResponse {
  success?: boolean;
  message?: string;
  error?: string;
  qrcode?: string;
  state?: string;
  number?: string;
}
