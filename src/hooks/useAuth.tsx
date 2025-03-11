
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Organization, User as AppUser } from '@/types/organization';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  organization: Organization | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, orgName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  subscriptionExpiringSoon: boolean;
  refetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [subscriptionExpiringSoon, setSubscriptionExpiringSoon] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user data with organization details
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

        setAppUser(appUserData);
        setOrganization(orgData);
        setIsAdmin(orgData.isAdmin);
        setIsBlocked(orgData.blocked);

        // Check if subscription is about to expire
        const dueDate = new Date(orgData.subscriptionDueDate);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        setSubscriptionExpiringSoon(diffDays <= 7 && diffDays > 0 && orgData.subscriptionStatus === 'active');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
    }
  };

  const refetchUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setAppUser(null);
        setOrganization(null);
        setIsAdmin(false);
        setIsBlocked(false);
        setSubscriptionExpiringSoon(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Redirect based on user type
      const { data: userData } = await supabase
        .from('users')
        .select('*, organizations:organization_id(*)')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData?.organizations?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Login error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, orgName: string) => {
    try {
      // Check if email is already in use
      const { data: emailCheck } = await supabase
        .from('organizations')
        .select('email')
        .eq('email', email)
        .single();

      if (emailCheck) {
        throw new Error('This email is already in use');
      }

      // Create Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
            email: email,
            subscription_due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
          })
          .select()
          .single();
          
        if (orgError) throw orgError;
        
        // Create user associated with organization
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            organization_id: orgData.id,
            role: 'admin',
            email: email
          });
          
        if (userError) throw userError;
      }
      
      toast({
        title: "Account created successfully",
        description: "You can now log in to the system.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
      toast({
        title: "Logout successful",
        description: "See you soon!",
      });
    } catch (error: any) {
      toast({
        title: "Logout error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    appUser,
    organization,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin,
    isBlocked,
    subscriptionExpiringSoon,
    refetchUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
