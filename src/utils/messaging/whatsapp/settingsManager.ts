
/**
 * WhatsApp Settings Manager
 * 
 * Functions for managing WhatsApp instance settings in the database
 */

import { supabase } from "@/integrations/supabase/client";
import { InstanceSettings } from "../types";

export const settingsManager = {
  async saveInstanceSettings(
    organizationId: string,
    instanceName: string
  ): Promise<InstanceSettings> {
    try {
      console.log(`Salvando configurações para instância ${instanceName} (org: ${organizationId})`);
      
      // Verificar se já existe uma configuração para esta organização
      const { data: existingSettings, error: queryError } = await supabase
        .rpc('get_whatsapp_instance', { org_id: organizationId });
      
      if (queryError) {
        console.error('Erro ao verificar configurações existentes:', queryError);
        throw new Error(queryError.message);
      }
      
      let result;
      
      if (existingSettings) {
        // Atualizar configurações existentes
        const { data, error } = await supabase
          .rpc('update_whatsapp_instance', { 
            org_id: organizationId,
            instance_name_param: instanceName
          });
        
        if (error) throw error;
        result = data;
      } else {
        // Inserir novas configurações
        const { data, error } = await supabase
          .rpc('create_whatsapp_instance', { 
            org_id: organizationId,
            instance_name_param: instanceName
          });
        
        if (error) throw error;
        result = data;
      }
      
      return {
        success: true,
        instanceName: instanceName
      };
    } catch (error) {
      console.error('Erro ao salvar configurações do WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  },
  
  async getInstanceSettings(
    organizationId: string
  ): Promise<InstanceSettings> {
    try {
      console.log(`Obtendo configurações da instância para org ${organizationId}`);
      
      const { data, error } = await supabase
        .rpc('get_whatsapp_instance', { org_id: organizationId });
      
      if (error) {
        console.error('Erro ao obter configurações do WhatsApp:', error);
        return {
          success: false,
          message: 'Nenhuma instância configurada'
        };
      }
      
      if (!data) {
        return {
          success: false,
          message: 'Nenhuma instância configurada'
        };
      }
      
      // Corrigido para acessar as propriedades do objeto JSON retornado pela função
      return {
        success: true,
        instanceName: data.instance_name,
        status: data.status,
        qrCode: data.qrcode
      };
    } catch (error) {
      console.error('Erro ao obter configurações do WhatsApp:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
};
