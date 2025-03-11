
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { OrganizationHeader } from "./components/OrganizationHeader";
import { OrganizationInfo } from "./components/OrganizationInfo";
import { SubscriptionDetails } from "./components/SubscriptionDetails";
import { OrganizationStats } from "./components/OrganizationStats";
import { OrganizationActions } from "./components/OrganizationActions";
import { LoadingState } from "./components/organization/LoadingState";
import { EmptyState } from "./components/organization/EmptyState";
import { useOrganizationDetails } from "./hooks/useOrganizationDetails";
import { useOrganizationActions } from "./hooks/useOrganizationActions";
import { Organization } from "@/types/organization";

export default function AdminOrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { organization, loading, stats, fetchOrganizationDetails } = useOrganizationDetails(id);

  const handleOrganizationUpdate = (updatedOrg: Organization) => {
    if (updatedOrg.id) {
      fetchOrganizationDetails(updatedOrg.id);
    }
  };

  const { toggleBlockOrganization, updateSubscription } = useOrganizationActions({
    organization,
    onOrganizationUpdate: handleOrganizationUpdate
  });

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
