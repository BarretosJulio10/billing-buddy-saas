
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserData } from './authUtils';

export function useSignIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to sign in: ${email}`);
      
      // Special case for admin login
      if (email === 'julioquintanilha@hotmail.com' && password === 'Gigi553518-+.#') {
        console.log('Admin login detected');
        
        // Check if admin account exists in auth
        const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (existingUser?.user) {
          console.log('Admin user exists, getting details');
          
          // Redirect to admin dashboard directly
          navigate('/admin');
          
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo administrador!",
          });
          
          return;
        }
        
        // If admin doesn't exist in auth, create the user
        console.log('Creating admin user');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) {
          console.error('Error creating admin user:', signUpError);
          throw signUpError;
        }
        
        // Create admin organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: 'Admin',
            email: email,
            is_admin: true,
            subscription_status: 'permanent',
            subscription_due_date: '2099-12-31',
            blocked: false,
          })
          .select()
          .single();
        
        if (orgError) {
          console.error('Organization creation error:', orgError);
          throw orgError;
        }
        
        // Create user profile
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: signUpData.user?.id,
            organization_id: orgData.id,
            role: 'admin',
            email: email,
            first_name: 'Admin',
            last_name: 'System'
          });
        
        if (userError) {
          console.error('User profile creation error:', userError);
          throw userError;
        }
        
        // Redirect to admin dashboard directly
        navigate('/admin');
        
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo administrador!",
        });
        
        return;
      }
      
      // Regular user login flow
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      if (!authData.user) {
        console.error("User not found after login");
        throw new Error("User not found after login");
      }
      
      console.log("User authenticated successfully:", authData.user.id);

      // Fetch user and organization data
      const { appUser, organization, isAdmin } = await fetchUserData(authData.user.id);
      
      if (!appUser) {
        // User needs to complete profile
        navigate('/complete-profile');
        return;
      }

      if (!organization) {
        console.error("Organization not found for user:", appUser.id);
        throw new Error("Organization data not found. Please contact support.");
      }

      // Determine if user is admin and redirect accordingly
      if (isAdmin || email === 'julioquintanilha@hotmail.com') {
        navigate('/admin');
      } else {
        navigate('/');
      }

      toast({
        title: "Login realizado com sucesso",
        description: isAdmin ? "Bem-vindo de volta, Admin!" : "Bem-vindo de volta!",
      });
    } catch (error: any) {
      console.error('Full login error details:', error);
      toast({
        title: "Erro de login",
        description: error.message || "Falha na autenticação",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading
  };
}
