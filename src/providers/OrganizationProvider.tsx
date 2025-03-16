
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Organization, User, SubscriptionDetails } from '@/types/organization';

interface OrganizationContextType {
  organization: Organization | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  subscriptionDetails: SubscriptionDetails | null;
  refreshOrganization: () => Promise<void>;
  updateOrganizationSettings: (updates: Partial<Organization>) => Promise<boolean>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const { user: authUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Maps database organization to frontend organization model
  const mapOrganization = (dbOrg: any): Organization => {
    const today = new Date();
    const dueDate = dbOrg.subscription_due_date ? new Date(dbOrg.subscription_due_date) : null;
    const isExpiringSoon = dueDate ? 
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 7 : 
      false;

    return {
      id: dbOrg.id,
      name: dbOrg.name,
      email: dbOrg.email,
      phone: dbOrg.phone || undefined,
      createdAt: dbOrg.created_at,
      updatedAt: dbOrg.updated_at,
      subscriptionStatus: dbOrg.subscription_status,
      subscriptionDueDate: dbOrg.subscription_due_date,
      subscriptionAmount: dbOrg.subscription_amount || 0,
      lastPaymentDate: dbOrg.last_payment_date,
      gateway: dbOrg.gateway || 'mercadopago',
      isAdmin: dbOrg.is_admin || false,
      blocked: dbOrg.blocked || false,
      subscriptionExpiringSoon: isExpiringSoon,
    };
  };

  // Maps database user to frontend user model
  const mapUser = (dbUser: any): User => {
    return {
      id: dbUser.id,
      organizationId: dbUser.organization_id,
      firstName: dbUser.first_name || undefined,
      lastName: dbUser.last_name || undefined,
      email: authUser?.email || '',
      role: dbUser.role,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  };

  // Extract subscription details from organization
  const extractSubscriptionDetails = (org: Organization): SubscriptionDetails => {
    return {
      status: org.subscriptionStatus,
      dueDate: org.subscriptionDueDate,
      amount: org.subscriptionAmount,
      lastPaymentDate: org.lastPaymentDate,
      gateway: org.gateway,
      blocked: org.blocked,
    };
  };

  const fetchOrganizationData = async () => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user data with organization information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          organization_id,
          first_name,
          last_name,
          role,
          created_at,
          updated_at
        `)
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setError('Failed to load user data');
        setLoading(false);
        return;
      }

      if (!userData || !userData.organization_id) {
        console.log('User needs to complete profile');
        setLoading(false);
        navigate('/complete-profile');
        return;
      }

      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization data:', orgError);
        setError('Failed to load organization data');
        setLoading(false);
        return;
      }

      const mappedUser = mapUser(userData);
      const mappedOrg = mapOrganization(orgData);
      
      setUser(mappedUser);
      setOrganization(mappedOrg);
      setSubscriptionDetails(extractSubscriptionDetails(mappedOrg));

      // Check if organization is blocked and subscription status
      if (mappedOrg.blocked && window.location.pathname !== '/blocked') {
        navigate('/blocked');
      }

    } catch (err: any) {
      console.error('Error in organization provider:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrganization = async () => {
    await fetchOrganizationData();
  };

  const updateOrganizationSettings = async (updates: Partial<Organization>): Promise<boolean> => {
    if (!organization) return false;
    
    try {
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
      
      await refreshOrganization();
      
      toast({
        title: 'Sucesso',
        description: 'Informações da organização atualizadas com sucesso',
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateOrganizationSettings:', error);
      return false;
    }
  };

  // Effect to load organization data when auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchOrganizationData();
    }
  }, [authUser, authLoading]);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        user,
        loading,
        error,
        isAdmin: organization?.isAdmin || false,
        subscriptionDetails,
        refreshOrganization,
        updateOrganizationSettings,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
