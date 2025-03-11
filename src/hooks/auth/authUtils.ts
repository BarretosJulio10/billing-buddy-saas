
import { supabase } from '@/integrations/supabase/client';
import { Organization, User as AppUser } from '@/types/organization';

export async function fetchUserData(userId: string): Promise<{ 
  appUser: AppUser | null; 
  organization: Organization | null;
  isAdmin: boolean;
  isBlocked: boolean;
  subscriptionExpiringSoon: boolean;
}> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, organizations:organization_id(*)')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (userData) {
      const appUserData: AppUser = {
        id: userData.id,
        organizationId: userData.organization_id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.organizations.email,
        role: userData.role as 'admin' | 'user',
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };

      const orgData: Organization = {
        id: userData.organizations.id,
        name: userData.organizations.name,
        email: userData.organizations.email,
        phone: userData.organizations.phone,
        createdAt: userData.organizations.created_at,
        updatedAt: userData.organizations.updated_at,
        subscriptionStatus: userData.organizations.subscription_status as 'active' | 'overdue' | 'canceled' | 'permanent',
        subscriptionDueDate: userData.organizations.subscription_due_date,
        subscriptionAmount: userData.organizations.subscription_amount,
        lastPaymentDate: userData.organizations.last_payment_date,
        gateway: userData.organizations.gateway as 'mercadopago' | 'asaas',
        isAdmin: userData.organizations.is_admin,
        blocked: userData.organizations.blocked
      };

      const dueDate = new Date(orgData.subscriptionDueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const subscriptionExpiringSoon = diffDays <= 7 && diffDays > 0 && orgData.subscriptionStatus === 'active';

      return {
        appUser: appUserData,
        organization: orgData,
        isAdmin: orgData.isAdmin,
        isBlocked: orgData.blocked,
        subscriptionExpiringSoon
      };
    }
    
    return {
      appUser: null,
      organization: null,
      isAdmin: false,
      isBlocked: false,
      subscriptionExpiringSoon: false
    };
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    return {
      appUser: null,
      organization: null,
      isAdmin: false,
      isBlocked: false,
      subscriptionExpiringSoon: false
    };
  }
}
