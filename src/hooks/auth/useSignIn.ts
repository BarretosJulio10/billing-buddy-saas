
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
        navigate('/admin');
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo!",
        });
        setLoading(false);
        return;
      }

      // Para usuários regulares, tentativa de buscar dados do usuário
      try {
        // Buscar usuário da tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, organizations:organization_id(id, blocked)')
          .eq('id', authData.user.id)
          .maybeSingle();
        
        if (userError) {
          console.error('Error fetching user data:', userError);
          // Se o erro for de permissão ou usuário não encontrado, redirecionar para completar perfil
          navigate('/complete-profile');
          setLoading(false);
          return;
        }

        if (!userData) {
          // Usuário precisa completar o perfil
          console.log("User needs to complete profile");
          navigate('/complete-profile');
          setLoading(false);
          return;
        }

        const isAdmin = userData.role === 'admin';
        const isBlocked = userData.organizations?.blocked || false;

        if (isBlocked && !isAdmin) {
          console.log("User account is blocked");
          navigate('/blocked');
          setLoading(false);
          return;
        }

        // Redirecionar para o painel apropriado
        navigate('/');
        
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!",
        });
      } catch (error: any) {
        console.error('Error processing user data after auth:', error);
        // Falha segura - redirecionar para completar perfil
        navigate('/complete-profile');
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

  return {
    signIn,
    loading
  };
}
