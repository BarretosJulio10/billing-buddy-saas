
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useSignUp() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, orgName: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to register: ${email} / ${orgName}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            org_name: orgName
          }
        }
      });
      
      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('No user returned from signup');
        throw new Error('Erro ao criar usuário. Por favor, tente novamente.');
      }
      
      console.log('Auth user created:', authData.user.id);
      
      // Create organization using service role connection to bypass RLS
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          email: email,
          subscription_due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
          subscription_status: 'active',
          blocked: false,
          slug: orgName.toLowerCase().replace(/\s+/g, '-')
        })
        .select()
        .single();
        
      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw orgError;
      }
      
      console.log('Organization created:', orgData.id);
      
      // Create user profile using a simplified approach to avoid RLS recursion
      const { error: userError } = await supabase.rpc('create_user_profile', {
        user_id: authData.user.id,
        org_id: orgData.id,
        user_role: 'admin',
        user_email: email
      });
        
      if (userError) {
        console.error('User profile creation error:', userError);
        throw userError;
      }
      
      console.log('User profile created for:', authData.user.id);
      
      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login no sistema.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    loading
  };
}
