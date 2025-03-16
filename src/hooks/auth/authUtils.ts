
import { supabase } from '@/integrations/supabase/client';
import { Organization, User as AppUser } from '@/types/organization';

export async function fetchUserData(userId: string, retryCount = 0): Promise<{ 
  appUser: AppUser | null; 
  organization: Organization | null;
  isAdmin: boolean;
  isBlocked: boolean;
  subscriptionExpiringSoon: boolean;
}> {
  try {
    console.log(`Fetching user data for user ID: ${userId} (attempt ${retryCount + 1})`);
    
    if (!userId) {
      console.log("No user ID provided");
      return {
        appUser: null,
        organization: null,
        isAdmin: false,
        isBlocked: false,
        subscriptionExpiringSoon: false
      };
    }
    
    // First, check if this is the admin user based on the auth email
    const { data: authUser } = await supabase.auth.getUser();
    const isSystemAdmin = authUser?.user?.email === 'julioquintanilha@hotmail.com';
    
    if (isSystemAdmin) {
      console.log("System admin detected, bypassing regular user data fetch");
      
      // For system admin, we'll create a minimal user profile without doing extra lookups
      const adminUser: AppUser = {
        id: userId,
        organizationId: '', // Will be populated later if needed
        firstName: 'Admin',
        lastName: 'System',
        email: 'julioquintanilha@hotmail.com',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Find admin organization
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('is_admin', true)
        .maybeSingle();
      
      // If admin organization exists, update the adminUser with it
      if (orgData) {
        adminUser.organizationId = orgData.id;
        
        const organizationData: Organization = {
          id: orgData.id,
          name: orgData.name || 'Admin System',
          email: orgData.email || 'julioquintanilha@hotmail.com',
          phone: orgData.phone,
          createdAt: orgData.created_at,
          updatedAt: orgData.updated_at,
          subscriptionStatus: 'permanent',
          subscriptionDueDate: orgData.subscription_due_date,
          subscriptionAmount: orgData.subscription_amount,
          lastPaymentDate: orgData.last_payment_date,
          gateway: orgData.gateway as 'mercadopago' | 'asaas',
          isAdmin: true,
          blocked: false
        };
        
        return {
          appUser: adminUser,
          organization: organizationData,
          isAdmin: true,
          isBlocked: false,
          subscriptionExpiringSoon: false
        };
      }
      
      // If no admin organization found, return just the admin user
      return {
        appUser: adminUser,
        organization: null,
        isAdmin: true,
        isBlocked: false,
        subscriptionExpiringSoon: false
      };
    }
    
    // For regular users, try to get user data
    let userData;
    try {
      // Use maybeSingle to avoid errors if no user is found
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        userData = data;
        console.log("User data found:", userData);
      }
    } catch (error) {
      console.error("Exception while fetching user data:", error);
    }
    
    if (!userData) {
      console.log("No user data found, user might need to complete profile");
      
      // If we're in a retry situation (especially after creating a profile), add a delay and retry
      if (retryCount < 3) {
        console.log(`Retrying user data fetch in ${500 * (retryCount + 1)}ms... (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
        return fetchUserData(userId, retryCount + 1);
      }
      
      return {
        appUser: null,
        organization: null,
        isAdmin: false,
        isBlocked: false,
        subscriptionExpiringSoon: false
      };
    }
    
    // Only attempt to fetch organization if there's an organization_id
    let orgData = null;
    
    if (userData.organization_id) {
      try {
        const { data: organization, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', userData.organization_id)
          .maybeSingle();
          
        if (orgError) {
          console.error("Error fetching organization data:", orgError);
        } else {
          orgData = organization;
          console.log("Organization data found:", orgData);
        }
      } catch (error) {
        console.error("Exception while fetching organization data:", error);
      }
    }
    
    // Now create proper objects with correct types
    const appUserData: AppUser = {
      id: userData.id,
      organizationId: userData.organization_id,
      firstName: userData.first_name,
      lastName: userData.last_name,
      email: (orgData?.email) || '',
      role: userData.role as 'admin' | 'user',
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    };

    // Calculate subscription expiring soon
    let subscriptionExpiringSoon = false;
    let organizationData: Organization | null = null;
    
    if (orgData) {
      organizationData = {
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
      
      if (organizationData.subscriptionDueDate) {
        const dueDate = new Date(organizationData.subscriptionDueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        subscriptionExpiringSoon = diffDays <= 7 && diffDays > 0 && 
          organizationData.subscriptionStatus === 'active';
      }
    }

    return {
      appUser: appUserData,
      organization: organizationData,
      isAdmin: userData.role === 'admin',
      isBlocked: (organizationData?.blocked) || false,
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
