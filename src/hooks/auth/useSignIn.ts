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
        
        // Try to sign in with admin credentials
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error('Admin sign in error:', signInError);
          // If failed, try to create admin user
          await createAdminUserAndOrg(email, password);
        } else if (authData.user) {
          console.log('Admin signed in successfully:', authData.user.id);
          navigate('/admin');
          
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo administrador!",
          });
          return;
        }
      } else {
        throw new Error("Este login é exclusivo para administradores");
      }
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

  // Helper function to create admin user and organization
  const createAdminUserAndOrg = async (email: string, password: string) => {
    try {
      console.log('Creating admin user and organization');
      
      // Sign up admin user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        console.error('Error creating admin user:', signUpError);
        throw signUpError;
      }
      
      if (!signUpData.user) {
        throw new Error('Failed to create admin user');
      }
      
      // Create admin organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: 'Admin',
          email: email,
          is_admin: true,
          slug: 'admin-system',
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
          id: signUpData.user.id,
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
    } catch (error) {
      console.error('Error in createAdminUserAndOrg:', error);
      toast({
        title: "Erro ao criar usuário admin",
        description: "Por favor, contate o suporte",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    signIn,
    loading
  };
}
