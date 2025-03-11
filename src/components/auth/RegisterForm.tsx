
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const registerSchema = z.object({
  organizationName: z.string().min(3, "O nome da empresa deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type RegisterFormProps = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export function RegisterForm({ isLoading, setIsLoading }: RegisterFormProps) {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [adminOrganizationId, setAdminOrganizationId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    async function fetchAdminOrganization() {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id')
          .eq('email', 'julioquintanilha@hotmail.com')
          .eq('is_admin', true)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching admin organization:', error);
          return;
        }
        
        if (data) {
          console.log('Admin organization found:', data.id);
          setAdminOrganizationId(data.id);
        }
      } catch (error) {
        console.error('Failed to fetch admin organization:', error);
      }
    }
    
    fetchAdminOrganization();
  }, []);

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      setIsLoading(true);
      
      if (data.email === 'julioquintanilha@hotmail.com' && adminOrganizationId) {
        console.log('Attempting admin registration...');
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              organization_id: adminOrganizationId,
              role: 'admin',
              first_name: 'Admin',
              last_name: 'System',
            });
            
          if (userError) throw userError;
          
          toast({
            title: "Conta de administrador criada",
            description: "Você pode agora fazer login como administrador.",
          });
          
          form.reset();
          return;
        }
      } else {
        await signUp(data.email, data.password, data.organizationName);
      }
      
      form.reset();
      
      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login no sistema.",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro ao criar sua conta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
        <FormField
          control={form.control}
          name="organizationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Sua Empresa Ltda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
}
