
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

      // Para usuários regulares, vamos apenas redirecionar inicialmente para minimizar 
      // chamadas de API, a verificação completa acontecerá na próxima renderização
      try {
        // Redirecionar para o painel apropriado e deixar a verificação completa para
        // os hooks de validação protegidos por try/catch na próxima renderização
        navigate('/');
        
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo!",
        });
      } catch (error: any) {
        console.error('Error after authentication:', error);
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
