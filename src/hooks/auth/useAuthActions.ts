
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAuthActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to sign in: ${email}`);
      
      // Special case for admin login
      if (email === 'julioquintanilha@hotmail.com' && password === 'Gigi553518-+.#') {
        console.log('Admin login detected');
        
        // Check if admin account exists in auth
        const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (existingUser?.user) {
          console.log('Admin user exists, getting details');
          
          // Redirect to admin dashboard directly
          navigate('/admin');
          
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo administrador!",
          });
          
          return;
        }
        
        // If admin doesn't exist in auth, create the user
        console.log('Creating admin user');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) {
          console.error('Error creating admin user:', signUpError);
          throw signUpError;
        }
        
        // Create admin organization
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: 'Admin',
            email: email,
            is_admin: true,
            subscription_status: 'permanent',
            subscription_due_date: '2099-12-31',
            blocked: false,
          })
          .select()
          .single();
        
        if (orgError) {
          console.error('Organization creation error:', orgError);
          throw orgError;
        }
        
        // Create user profile
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: signUpData.user?.id,
            organization_id: orgData.id,
            role: 'admin',
            email: email,
            first_name: 'Admin',
            last_name: 'System'
          });
        
        if (userError) {
          console.error('User profile creation error:', userError);
          throw userError;
        }
        
        // Redirect to admin dashboard directly
        navigate('/admin');
        
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo administrador!",
        });
        
        return;
      }
      
      // Regular user login flow
      // Try to sign in
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

      // Get organization data for the user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id, role, first_name, last_name')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }
      
      if (!userData) {
        console.error("User data not found for ID:", authData.user.id);
        // Create user entry if not exists
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            role: 'admin', // Default role
          });
          
        if (createUserError) {
          console.error("Error creating user data:", createUserError);
          throw createUserError;
        }
        
        // Retry fetching user data
        const { data: retryUserData, error: retryUserError } = await supabase
          .from('users')
          .select('organization_id, role, first_name, last_name')
          .eq('id', authData.user.id)
          .maybeSingle();
          
        if (retryUserError || !retryUserData) {
          console.error("Error fetching retry user data:", retryUserError);
          throw new Error("User data not found. Please contact support.");
        }
        
        console.log("Created and retrieved user data:", retryUserData);
        
        // Now redirect to registration completion page
        navigate('/complete-profile');
        return;
      }

      console.log("User data retrieved:", userData);
      
      // Now fetch the organization separately
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .maybeSingle();
        
      if (orgError) {
        console.error("Error fetching organization data:", orgError);
        throw orgError;
      }
      
      if (!orgData) {
        console.error("Organization not found:", userData.organization_id);
        throw new Error("Organization data not found. Please contact support.");
      }

      // Determine if user is admin and redirect accordingly
      const isAdmin = orgData.is_admin === true;
      console.log("Is admin:", isAdmin);
      
      const redirectPath = isAdmin ? '/admin' : '/';
      
      navigate(redirectPath);

      toast({
        title: "Login realizado com sucesso",
        description: isAdmin ? "Bem-vindo de volta, Admin!" : "Bem-vindo de volta!",
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

  const signUp = async (email: string, password: string, orgName: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to register: ${email} / ${orgName}`);
      
      // Check if email exists
      const { data: emailCheck, error: emailCheckError } = await supabase
        .from('organizations')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (emailCheckError) {
        console.error('Email check error:', emailCheckError);
        throw emailCheckError;
      }
      
      if (emailCheck) {
        console.error('Email already in use:', email);
        throw new Error('Este email já está em uso');
      }

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
      
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          email: email,
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
      
      console.log('Organization created:', orgData.id);
      
      // Create user profile
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          organization_id: orgData.id,
          role: 'admin',
          email: email
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

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
      toast({
        title: "Logout realizado com sucesso",
        description: "Até breve!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    loading,
  };
}
