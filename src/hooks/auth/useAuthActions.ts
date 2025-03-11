
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
      
      // Try to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Get current user data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not found after login");
      
      console.log("User authenticated successfully:", user.id);

      // Get organization data for the user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id, role, first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }
      
      if (!userData) {
        console.error("User data not found for ID:", user.id);
        throw new Error("User data not found. Please contact support.");
      }

      console.log("User data retrieved:", userData);
      
      // Now fetch the organization separately
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .maybeSingle();
        
      if (orgError) {
        console.error("Error fetching organization data:", orgError);
        throw orgError;
      }
      
      if (!orgData) {
        console.error("Organization not found:", userData.organization_id);
        throw new Error("Organization data not found. Please contact support.");
      }

      // Determine if user is admin and redirect accordingly
      const isAdmin = orgData.is_admin === true;
      console.log("Is admin:", isAdmin);
      
      const redirectPath = isAdmin ? '/admin' : '/';
      
      navigate(redirectPath);

      toast({
        title: "Login successful",
        description: isAdmin ? "Welcome back, Admin!" : "Welcome back!",
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
      
      // Check if email exists
      const { data: emailCheck, error: emailCheckError } = await supabase
        .from('organizations')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (emailCheckError) throw emailCheckError;
      
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
        
        if (orgData) {
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
