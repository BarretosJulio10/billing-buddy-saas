
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useImpersonation() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar se há um adminId no localStorage, o que indica que estamos impersonando
  useEffect(() => {
    const checkImpersonation = async () => {
      const adminId = localStorage.getItem('adminId');
      setIsImpersonating(!!adminId);
      setLoading(false);
    };

    checkImpersonation();
  }, []);

  // Função para encerrar a impersonação
  const endImpersonation = async () => {
    try {
      setLoading(true);
      const adminId = localStorage.getItem('adminId');
      
      if (!adminId) {
        throw new Error('ID do administrador não encontrado');
      }

      // Recuperar a sessão do admin
      const { data, error } = await supabase.functions.invoke('end-impersonation', {
        body: { adminId }
      });

      if (error) throw error;
      
      if (data?.token) {
        // Restaurar a sessão do admin
        await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refreshToken
        });
        
        // Limpar o adminId do localStorage
        localStorage.removeItem('adminId');
        
        // Mensagem de sucesso
        toast({
          title: "Impersonação encerrada",
          description: "Você retornou à sua conta de administrador"
        });
        
        // Redirecionar para o dashboard do admin
        navigate('/admin');
      } else {
        throw new Error("Token não recebido");
      }
    } catch (error: any) {
      console.error("Erro ao encerrar impersonação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível retornar à conta de administrador",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isImpersonating,
    endImpersonation,
    loading
  };
}
