
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization, SubscriptionDetails } from '@/types/organization';
import { useAuth } from './useAuth';

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  subscriptionDetails: SubscriptionDetails | null;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, appUser } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = async () => {
    if (!user || !appUser?.organizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', appUser.organizationId)
        .single();

      if (error) throw error;

      if (data) {
        const org: Organization = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          subscriptionStatus: data.subscription_status as 'active' | 'overdue' | 'canceled' | 'permanent',
          subscriptionDueDate: data.subscription_due_date,
          subscriptionAmount: data.subscription_amount,
          lastPaymentDate: data.last_payment_date,
          gateway: data.gateway as 'mercadopago' | 'asaas',
          isAdmin: data.is_admin,
          blocked: data.blocked
        };
        
        setOrganization(org);
        
        // Set subscription details
        setSubscriptionDetails({
          status: org.subscriptionStatus,
          dueDate: org.subscriptionDueDate,
          amount: org.subscriptionAmount,
          lastPaymentDate: org.lastPaymentDate,
          gateway: org.gateway,
          blocked: org.blocked
        });
      }
    } catch (err: any) {
      console.error('Error fetching organization:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [user, appUser]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        loading,
        error,
        subscriptionDetails,
        refreshOrganization: fetchOrganization
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
