
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      
      if (error) throw error;
      
      if (email === 'julioquintanilha@hotmail.com') {
        navigate('/admin');
        return;
      }

      // Use a more straightforward approach to avoid deep type nesting
      // First try to get the user's organization ID
      const userResponse = await supabase
        .from('users')
        .select('organization_id')
        .eq('email', email)
        .maybeSingle();
      
      if (userResponse.error) {
        console.error('Error fetching user:', userResponse.error);
        navigate('/');
        return;
      }

      if (!userResponse.data || !userResponse.data.organization_id) {
        console.log('User not found or has no organization');
        navigate('/');
        return;
      }
      
      // Now fetch the organization details
      const orgId = userResponse.data.organization_id;
      const orgResponse = await supabase
        .from('organizations')
        .select('is_admin')
        .eq('id', orgId)
        .maybeSingle();
      
      if (orgResponse.error) {
        console.error('Error fetching organization:', orgResponse.error);
        navigate('/');
        return;
      }
      
      // Navigate based on admin status
      if (orgResponse.data?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
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
