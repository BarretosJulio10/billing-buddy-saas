
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
    console.log(`Fetching user data for user ID: ${userId}`);
    
    // First, get the user data from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (userError) {
      console.error("Error fetching user data:", userError);
      throw userError;
    }
    
    if (!userData) {
      console.log("No user data found, user might need to complete profile");
      return {
        appUser: null,
        organization: null,
        isAdmin: false,
        isBlocked: false,
        subscriptionExpiringSoon: false
      };
    }
    
    console.log("User data found:", userData);
    
    // Only attempt to fetch organization if there's an organization_id
    let orgData = null;
    
    if (userData.organization_id) {
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .maybeSingle();
        
      if (orgError) {
        console.error("Error fetching organization data:", orgError);
        throw orgError;
      }
      
      if (!organization) {
        console.error("Organization not found:", userData.organization_id);
        // Since user exists but org doesn't, return partial data
        const appUserData: AppUser = {
          id: userData.id,
          organizationId: userData.organization_id,
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: '', // No email in users table, use empty string
          role: userData.role as 'admin' | 'user',
          createdAt: userData.created_at,
          updatedAt: userData.updated_at
        };
        
        return {
          appUser: appUserData,
          organization: null,
          isAdmin: false,
          isBlocked: false,
          subscriptionExpiringSoon: false
        };
      }
      
      orgData = organization;
      console.log("Organization data found:", orgData);
    }
    
    if (!orgData) {
      console.log("No organization data associated with user");
      // User exists but has no organization, return partial data
      const appUserData: AppUser = {
        id: userData.id,
        organizationId: userData.organization_id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: '', // No email in users table, use empty string
        role: userData.role as 'admin' | 'user',
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };
      
      return {
        appUser: appUserData,
        organization: null,
        isAdmin: false,
        isBlocked: false,
        subscriptionExpiringSoon: false
      };
    }
    
    // Now create proper objects with correct types
    const appUserData: AppUser = {
      id: userData.id,
      organizationId: userData.organization_id,
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: orgData.email || '', // Use organization email as fallback
      role: userData.role as 'admin' | 'user',
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    };

    const organizationData: Organization = {
      id: orgData.id,
      name: orgData.name,
      email: orgData.email,
      phone: orgData.phone,
      createdAt: orgData.created_at,
      updatedAt: orgData.updated_at,
      subscriptionStatus: orgData.subscription_status as 'active' | 'overdue' | 'canceled' | 'permanent',
      subscriptionDueDate: orgData.subscription_due_date,
      subscriptionAmount: orgData.subscription_amount,
      lastPaymentDate: orgData.last_payment_date,
      gateway: orgData.gateway as 'mercadopago' | 'asaas',
      isAdmin: orgData.is_admin,
      blocked: orgData.blocked
    };

    // Calculate if subscription is expiring soon
    let subscriptionExpiringSoon = false;
    
    if (organizationData.subscriptionDueDate) {
      const dueDate = new Date(organizationData.subscriptionDueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      subscriptionExpiringSoon = diffDays <= 7 && diffDays > 0 && 
        organizationData.subscriptionStatus === 'active';
    }

    return {
      appUser: appUserData,
      organization: organizationData,
      isAdmin: organizationData.isAdmin || false,
      isBlocked: organizationData.blocked || false,
      subscriptionExpiringSoon
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
