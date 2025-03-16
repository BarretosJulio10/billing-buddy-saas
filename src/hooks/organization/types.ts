
import { Organization, User, SubscriptionDetails } from '@/types/organization';

export interface OrganizationContextType {
  organization: Organization | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  subscriptionDetails: SubscriptionDetails | null;
  organizationId: string | null;
  refreshOrganization: () => Promise<void>;
  updateOrganizationSettings: (updates: Partial<Organization>) => Promise<boolean>;
}
