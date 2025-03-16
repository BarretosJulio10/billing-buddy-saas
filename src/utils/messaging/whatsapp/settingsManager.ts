
/**
 * WhatsApp Settings Manager
 * 
 * Functions for managing WhatsApp instance settings in the database
 */

import { supabase } from "@/integrations/supabase/client";
import { InstanceActionResult, InstanceSettingsResult } from "../types";

export const settingsManager = {
  async saveInstanceSettings(
    organizationId: string,
    instanceName: string
  ): Promise<InstanceActionResult> {
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
  
  async getInstanceSettings(
    organizationId: string
  ): Promise<InstanceSettingsResult> {
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
  }
};
