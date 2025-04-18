
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        navigate('/admin', { replace: true });
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo!",
        });
        setLoading(false);
        return;
      }

      // For regular users, we'll check if the user profile is complete
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, organization_id')
        .eq('id', authData.user.id)
        .single();
        
      // Se o perfil não estiver completo, redirecione para a página de conclusão de perfil
      if (!userData?.first_name || !userData?.organization_id) {
        navigate('/complete-profile', { replace: true });
      } else {
        // Perfil está completo, redirecione para a página principal
        navigate('/', { replace: true });
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo!",
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
