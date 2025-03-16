
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/types/organization';
import { useToast } from '@/components/ui/use-toast';

export const useOrganizationSettings = (
  organization: Organization | null,
  refreshData: () => Promise<void>
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateOrganizationSettings = async (updates: Partial<Organization>): Promise<boolean> => {
    if (!organization) return false;
    
    try {
      setIsUpdating(true);
      // Convert frontend model to database model
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.subscriptionStatus) dbUpdates.subscription_status = updates.subscriptionStatus;
      if (updates.subscriptionDueDate) dbUpdates.subscription_due_date = updates.subscriptionDueDate;
      if (updates.subscriptionAmount !== undefined) dbUpdates.subscription_amount = updates.subscriptionAmount;
      if (updates.lastPaymentDate) dbUpdates.last_payment_date = updates.lastPaymentDate;
      if (updates.gateway) dbUpdates.gateway = updates.gateway;
      if (updates.blocked !== undefined) dbUpdates.blocked = updates.blocked;
      
      const { error } = await supabase
        .from('organizations')
        .update(dbUpdates)
        .eq('id', organization.id);
      
      if (error) {
        console.error('Error updating organization:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar as informações da organização',
          variant: 'destructive'
        });
        return false;
      }
      
      await refreshData();
      
      toast({
        title: 'Sucesso',
        description: 'Informações da organização atualizadas com sucesso',
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateOrganizationSettings:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateOrganizationSettings,
    isUpdating
  };
};
