
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn } from "lucide-react";

export default function ImpersonateOrg() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, email')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrganization(data);
      } catch (error: any) {
        console.error("Error fetching organization:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da organização",
          variant: "destructive"
        });
        navigate('/admin/organizations');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrganization();
    }
  }, [id, navigate, toast]);

  const handleImpersonate = async () => {
    try {
      setLoading(true);
      // Armazenar o ID do admin atual para poder reverter depois
      localStorage.setItem('adminId', (await supabase.auth.getUser()).data.user?.id || '');
      
      // Criar sessão temporária para a organização
      const { data, error } = await supabase.functions.invoke('impersonate-organization', {
        body: { organizationId: id }
      });

      if (error) throw error;
      
      if (data?.token) {
        // Definir a sessão com o token recebido
        await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refreshToken
        });
        
        toast({
          title: "Acesso concedido",
          description: `Você está acessando como ${organization?.name}`
        });
        
        // Redirecionar para o dashboard da organização
        navigate('/');
      } else {
        throw new Error("Token não recebido");
      }
    } catch (error: any) {
      console.error("Error impersonating organization:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a conta da organização",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !organization) {
    return (
      <div className="container max-w-md mx-auto p-4 flex justify-center items-center min-h-[50vh]">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/admin/organizations')} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Acessar como Organização</CardTitle>
          <CardDescription>
            Você está prestes a acessar o sistema como a organização {organization?.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 p-4 text-amber-800 border border-amber-200">
            <p className="text-sm">
              Atenção: Você está prestes a acessar o sistema com as permissões da organização. 
              Todas as ações serão registradas como se fossem feitas pela organização.
            </p>
          </div>
          
          <div className="grid gap-2">
            <div className="font-medium">Organização:</div>
            <div>{organization?.name}</div>
          </div>
          
          <div className="grid gap-2">
            <div className="font-medium">Email:</div>
            <div>{organization?.email}</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full flex items-center gap-2" 
            onClick={handleImpersonate}
            disabled={loading}
          >
            <LogIn className="h-4 w-4" />
            Acessar como {organization?.name}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
