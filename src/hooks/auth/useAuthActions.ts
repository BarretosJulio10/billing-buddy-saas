import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Simple interface for organization data to avoid deep type instantiation
interface OrganizationData {
  id: string;
  is_admin: boolean;
}

export function useAuthActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to sign in: ${email}`);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      const isAdminEmail = email === 'julioquintanilha@hotmail.com';
      
      if (isAdminEmail) {
        navigate('/admin');
      } else {
        const { data, error: userDataError } = await supabase
          .from('users')
          .select('organization_id')
          .eq('email', email)
          .maybeSingle();
        
        if (userDataError) {
          console.error('Error fetching user data:', userDataError);
        }

        const { data: orgData } = await supabase
          .from('organizations')
          .select('is_admin')
          .eq('id', data?.organization_id)
          .single();
        
        if (orgData?.is_admin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error('Full login error details:', error);
      toast({
        title: "Login error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, orgName: string) => {
    try {
      setLoading(true);
      const { data: emailCheck } = await supabase
        .from('organizations')
        .select('email')
        .eq('email', email)
        .single();

      if (emailCheck) {
        throw new Error('This email is already in use');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
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
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    loading,
  };
}
