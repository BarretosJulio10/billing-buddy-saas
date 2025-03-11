
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/hooks/useAuth";

const profileSchema = z.object({
  orgName: z.string().min(3, "O nome da organização deve ter pelo menos 3 caracteres"),
  firstName: z.string().min(2, "O primeiro nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().optional(),
});

export default function CompleteProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, refetchUserData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      orgName: "",
      firstName: "",
      lastName: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para completar seu perfil",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.orgName,
          email: user.email || "",
          subscription_due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
          subscription_status: 'active',
          blocked: false,
        })
        .select()
        .single();
        
      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw orgError;
      }
      
      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          organization_id: orgData.id,
          first_name: data.firstName,
          last_name: data.lastName || null,
          role: 'admin',
        })
        .eq('id', user.id);
        
      if (userError) {
        console.error('User profile update error:', userError);
        throw userError;
      }
      
      await refetchUserData();
      
      toast({
        title: "Perfil completado",
        description: "Seu perfil foi atualizado com sucesso",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast({
        title: "Erro ao completar perfil",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Complete seu perfil</CardTitle>
          <CardDescription className="text-center">
            Precisamos de mais algumas informações para configurar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="orgName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Organização</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua empresa ou organização" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primeiro Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu primeiro nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processando..." : "Completar Perfil"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
