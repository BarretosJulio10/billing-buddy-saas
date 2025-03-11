
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";

interface UseOrganizationActionsProps {
  organization: Organization | null;
  onOrganizationUpdate?: (updatedOrg: Organization) => void;
}

export function useOrganizationActions({ organization, onOrganizationUpdate }: UseOrganizationActionsProps) {
  const { toast } = useToast();

  const toggleBlockOrganization = async () => {
    if (!organization) return;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ blocked: !organization.blocked })
        .eq('id', organization.id);

      if (error) throw error;

      const updatedOrg = {
        ...organization,
        blocked: !organization.blocked
      };
      
      if (onOrganizationUpdate) {
        onOrganizationUpdate(updatedOrg);
      }
      
      toast({
        title: updatedOrg.blocked ? "Company blocked" : "Company unblocked",
        description: updatedOrg.blocked 
          ? "The company has been successfully blocked" 
          : "The company has been successfully unblocked",
      });
    } catch (error) {
      console.error('Error changing organization status:', error);
      toast({
        title: "Error",
        description: "Could not change company status",
        variant: "destructive"
      });
    }
  };

  const updateSubscription = async (data: {
    amount: string;
    dueDate: string;
    gateway: Organization['gateway'];
  }) => {
    if (!organization) return;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          subscription_amount: Number(data.amount),
          subscription_due_date: data.dueDate,
          gateway: data.gateway,
          blocked: false,
          subscription_status: 'active'
        })
        .eq('id', organization.id);

      if (error) throw error;

      const updatedOrg = {
        ...organization,
        subscriptionAmount: Number(data.amount),
        subscriptionDueDate: data.dueDate,
        gateway: data.gateway,
        blocked: false,
        subscriptionStatus: 'active' as const
      };

      if (onOrganizationUpdate) {
        onOrganizationUpdate(updatedOrg);
      }
      
      toast({
        title: "Subscription updated",
        description: "Subscription data has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Could not update subscription data",
        variant: "destructive"
      });
    }
  };

  return {
    toggleBlockOrganization,
    updateSubscription
  };
}
