
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
      
      // Check if this is the admin user
      const isAdminEmail = email === 'julioquintanilha@hotmail.com';
      
      // Sign in with provided credentials
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

      // Admin login handler - bypass all regular flow for admin user
      if (isAdminEmail && password === 'Gigi553518-+.#') {
        console.log("Admin user detected, redirecting to admin panel");
        navigate('/admin');
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo administrador!",
        });
        setLoading(false);
        return;
      }

      // For regular users, fetch user data to check profile completion
      const { appUser, organization, isAdmin } = await fetchUserData(authData.user.id);
      
      if (!appUser) {
        // User needs to complete profile
        console.log("User needs to complete profile");
        navigate('/complete-profile');
        setLoading(false);
        return;
      }

      if (!organization) {
        console.error("Organization not found for user:", appUser.id);
        throw new Error("Organization data not found. Please contact support.");
      }

      // Check if user has admin role in their organization (not the main admin)
      if (isAdmin && !isAdminEmail) {
        console.log("Organization admin user detected, redirecting to company panel");
        navigate('/');
      } else if (isAdminEmail) {
        // Double check for admin email to ensure they always go to admin panel
        console.log("Admin email detected, redirecting to admin panel");
        navigate('/admin');
      } else {
        console.log("Regular user detected, redirecting to company panel");
        navigate('/');
      }

      toast({
        title: "Login realizado com sucesso",
        description: isAdminEmail ? "Bem-vindo administrador!" : "Bem-vindo de volta!",
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
