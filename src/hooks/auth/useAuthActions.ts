
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSignIn } from './useSignIn';
import { useSignUp } from './useSignUp';
import { useSignOut } from './useSignOut';

export function useAuthActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn: serviceSignIn, loading: signInLoading } = useSignIn();
  const { signUp: serviceSignUp, loading: signUpLoading } = useSignUp();
  const { signOut: serviceSignOut, loading: signOutLoading } = useSignOut();

  const signIn = async (email: string, password: string) => {
    try {
      await serviceSignIn(email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      // Error handling is already in the useSignIn hook
    }
  };

  const signUp = async (email: string, password: string, orgName: string) => {
    try {
      return await serviceSignUp(email, password, orgName);
    } catch (error: any) {
      console.error('Sign up error:', error);
      // Error handling is already in the useSignUp hook
      return false;
    }
  };

  const signOut = async () => {
    try {
      // Check if we're impersonating a user
      const adminId = localStorage.getItem('adminId');
      if (adminId) {
        // End impersonation and return to admin panel
        try {
          // Remove admin ID from local storage
          localStorage.removeItem('adminId');
          
          // Sign out current session
          await serviceSignOut();
          
          // Create a new sign-in with the admin credentials
          const { data, error } = await supabase.auth.signInWithPassword({
            email: 'julioquintanilha@hotmail.com',
            password: 'Gigi553518-+.#'
          });
          
          if (error) throw error;
          
          navigate('/admin');
          
          toast({
            title: "Retorno ao Admin",
            description: "Você retornou à sua conta administrativa"
          });
        } catch (error) {
          console.error('Error ending impersonation:', error);
          
          // If something goes wrong, just do a regular sign out
          await serviceSignOut();
          navigate('/login');
          
          toast({
            title: "Sessão encerrada",
            description: "Você foi desconectado do sistema",
          });
        }
      } else {
        // Regular sign out
        await serviceSignOut();
        navigate('/login');
        
        toast({
          title: "Sessão encerrada",
          description: "Você foi desconectado do sistema",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar sair do sistema",
        variant: "destructive",
      });
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    loading: signInLoading || signUpLoading || signOutLoading
  };
}
