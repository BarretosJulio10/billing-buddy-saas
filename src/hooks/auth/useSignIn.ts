
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
      
      // Verificação explícita para o admin usando constantes para evitar erros
      const ADMIN_EMAIL = 'julioquintanilha@hotmail.com';
      const ADMIN_PASSWORD = 'Gigi553518-+.#';
      const isAdminUser = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
      
      // Autenticação com o Supabase
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

      // Tratamento especial para o administrador - bypass completo do fluxo regular
      if (isAdminUser) {
        console.log("Admin credentials detected, redirecting to admin panel");
        navigate('/admin');
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo administrador!",
        });
        setLoading(false);
        return;
      }

      // Para usuários regulares, buscar dados do usuário para verificar a conclusão do perfil
      const { appUser, organization, isAdmin } = await fetchUserData(authData.user.id);
      
      if (!appUser) {
        // Usuário precisa completar o perfil
        console.log("User needs to complete profile");
        navigate('/complete-profile');
        setLoading(false);
        return;
      }

      if (!organization) {
        console.error("Organization not found for user:", appUser.id);
        throw new Error("Organization data not found. Please contact support.");
      }

      // Apenas usuários regulares devem chegar aqui - sempre redirecionar para o painel da empresa
      console.log("Regular user detected, redirecting to company panel");
      navigate('/');

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
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
