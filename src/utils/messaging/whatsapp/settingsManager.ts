
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
        .from('whatsapp_instances')
        .select('*')
        .eq('organization_id', organizationId)
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao verificar configurações existentes:', queryError);
        throw new Error(queryError.message);
      }
      
      let result;
      
      if (existingSettings) {
        // Atualizar configurações existentes
        const { data, error } = await supabase
          .from('whatsapp_instances')
          .update({
            instance_name: instanceName,
            updated_at: new Date().toISOString()
          })
          .eq('organization_id', organizationId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Inserir novas configurações
        const { data, error } = await supabase
          .from('whatsapp_instances')
          .insert({
            organization_id: organizationId,
            instance_name: instanceName,
            status: 'pending'
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      return {
        success: true,
        instanceName: result.instance_name
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
        .from('whatsapp_instances')
        .select('*')
        .eq('organization_id', organizationId)
        .single();
      
      if (error) {
        // Se for erro "not found", retornamos sucesso=false mas sem mensagem de erro
        if (error.code === 'PGRST116') {
          return {
            success: false,
            message: 'Nenhuma instância configurada'
          };
        }
        
        throw error;
      }
      
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
