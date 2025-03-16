
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Organization, User, SubscriptionDetails } from '@/types/organization';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export const useOrganizationData = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const { user: authUser, loading: authLoading, appUser } = useAuth();
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
    // Don't try to fetch if we don't have a user yet
    if (!authUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Skip loading on specific pages where organization data isn't needed yet
      const currentPath = window.location.pathname;
      const skipPaths = ['/login', '/complete-profile', '/blocked', '/admin'];
      
      if (skipPaths.some(path => currentPath === path || currentPath.startsWith(path))) {
        console.log(`Skipping organization data fetch on ${currentPath}`);
        setLoading(false);
        return;
      }
      
      // If we already have an appUser from auth context with organizationId, use that
      // This helps avoid race conditions and extra database calls
      if (appUser?.organizationId) {
        console.log(`Using existing appUser data: ${appUser.id}, org: ${appUser.organizationId}`);
        // We have the app user, but we still need to fetch organization details
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', appUser.organizationId)
          .maybeSingle();

        if (orgError) {
          console.error('Error fetching organization data:', orgError);
          setError('Failed to load organization data');
          setLoading(false);
          return;
        }

        if (!orgData) {
          console.error('Organization not found:', appUser.organizationId);
          setError('Organization not found');
          setLoading(false);
          
          // Redirect to complete profile
          if (!skipPaths.some(path => currentPath === path || currentPath.startsWith(path))) {
            navigate('/complete-profile', { replace: true });
          }
          return;
        }

        // Use existing appUser and newly fetched organization
        setUser(appUser as User);
        const mappedOrg = mapOrganization(orgData);
        setOrganization(mappedOrg);
        setSubscriptionDetails(extractSubscriptionDetails(mappedOrg));
        
        // Check if organization is blocked
        if (mappedOrg.blocked && currentPath !== '/blocked') {
          navigate('/blocked', { replace: true });
        }
        
        setLoading(false);
        return;
      }

      // If we don't have appUser with organizationId, fetch user data from database
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
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
        setError('Failed to load user data');
        setLoading(false);
        
        // Redirect to complete profile if not on a special page
        if (!skipPaths.some(path => currentPath === path || currentPath.startsWith(path))) {
          navigate('/complete-profile', { replace: true });
        }
        return;
      }

      if (!userData || !userData.organization_id) {
        console.log('User needs to complete profile');
        setLoading(false);
        
        // Redirect to complete profile if not on a special page
        if (!skipPaths.some(path => currentPath === path || currentPath.startsWith(path))) {
          navigate('/complete-profile', { replace: true });
        }
        return;
      }

      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .maybeSingle();

      if (orgError) {
        console.error('Error fetching organization data:', orgError);
        setError('Failed to load organization data');
        setLoading(false);
        return;
      }

      if (!orgData) {
        console.error('Organization not found:', userData.organization_id);
        setError('Organization not found');
        setLoading(false);
        
        // Redirect to complete profile to fix this situation
        if (!skipPaths.some(path => currentPath === path || currentPath.startsWith(path))) {
          navigate('/complete-profile', { replace: true });
        }
        return;
      }

      const mappedUser = mapUser(userData);
      const mappedOrg = mapOrganization(orgData);
      
      setUser(mappedUser);
      setOrganization(mappedOrg);
      setSubscriptionDetails(extractSubscriptionDetails(mappedOrg));

      // Check if organization is blocked
      if (mappedOrg.blocked && currentPath !== '/blocked') {
        navigate('/blocked', { replace: true });
      }

    } catch (err: any) {
      console.error('Error in organization provider:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Effect to load organization data when auth state changes
  useEffect(() => {
    // Skip loading on login, complete profile, and blocked pages
    const currentPath = window.location.pathname;
    const skipPaths = ['/login', '/complete-profile', '/blocked', '/admin'];
    
    if (skipPaths.some(path => currentPath === path || currentPath.startsWith(path))) {
      console.log(`Skipping organization data initial fetch on ${currentPath}`);
      setLoading(false);
      return;
    }
    
    if (!authLoading) {
      fetchOrganizationData();
    }
  }, [authUser, authLoading, appUser, window.location.pathname]);

  return {
    organization,
    user,
    loading,
    error,
    subscriptionDetails,
    fetchOrganizationData,
    mapOrganization,
    mapUser,
    extractSubscriptionDetails
  };
};
