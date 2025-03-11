
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { OrganizationHeader } from "./components/OrganizationHeader";
import { OrganizationInfo } from "./components/OrganizationInfo";
import { SubscriptionDetails } from "./components/SubscriptionDetails";
import { OrganizationStats } from "./components/OrganizationStats";
import { OrganizationActions } from "./components/OrganizationActions";
import { LoadingState } from "./components/organization/LoadingState";
import { EmptyState } from "./components/organization/EmptyState";
import { useOrganizationDetails } from "./hooks/useOrganizationDetails";

export default function AdminOrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization, loading, stats } = useOrganizationDetails(id);

  const toggleBlockOrganization = async () => {
    if (!organization) return;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ blocked: !organization.blocked })
        .eq('id', organization.id);

      if (error) throw error;

      organization.blocked = !organization.blocked;
      
      toast({
        title: organization.blocked ? "Company blocked" : "Company unblocked",
        description: organization.blocked 
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

  const updateSubscription = async (data: any) => {
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

      Object.assign(organization, {
        subscriptionAmount: Number(data.amount),
        subscriptionDueDate: data.dueDate,
        gateway: data.gateway,
        blocked: false,
        subscriptionStatus: 'active'
      });
      
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

  if (loading) {
    return <LoadingState />;
  }

  if (!organization) {
    return <EmptyState />;
  }

  const isOverdue = new Date(organization.subscriptionDueDate) < new Date() && organization.subscriptionStatus === 'active';

  return (
    <div className="space-y-6">
      <OrganizationHeader 
        organization={organization}
        onToggleBlock={toggleBlockOrganization}
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <OrganizationInfo 
            organization={organization}
            isOverdue={isOverdue}
          />
          
          <SubscriptionDetails 
            organization={organization}
            isOverdue={isOverdue}
            onUpdateSubscription={updateSubscription}
          />
        </div>
        
        <div className="w-full md:w-2/3 space-y-6">
          <OrganizationStats stats={stats} />
          <OrganizationActions 
            organization={organization}
            onToggleBlock={toggleBlockOrganization}
          />
        </div>
      </div>
    </div>
  );
}
