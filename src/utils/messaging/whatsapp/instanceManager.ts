
/**
 * WhatsApp Instance Manager
 * 
 * Functions for managing WhatsApp instances
 */

import { ConnectionResult, InstanceActionResult, QRCodeResult } from "../types";
import { EVOLUTION_API_KEY, EVOLUTION_API_URL } from "./config";

export const instanceManager = {
  async createInstance(
    instanceName: string,
    organizationId: string
  ): Promise<InstanceActionResult> {
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
  
  async getQRCode(
    instanceName: string
  ): Promise<QRCodeResult> {
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
  
  async checkConnection(
    instanceName: string
  ): Promise<ConnectionResult> {
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
        connected: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  async disconnect(
    instanceName: string
  ): Promise<InstanceActionResult> {
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
  
  async deleteInstance(
    instanceName: string
  ): Promise<InstanceActionResult> {
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
