
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verificar se já existe um usuário admin
    const { data: existingAdmin, error: findError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', 'julioquintanilha@hotmail.com')
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error("Erro ao verificar usuário existente:", findError);
      throw findError;
    }

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ message: "Admin já existe", user: existingAdmin }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Criar usuário admin no auth
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email: 'julioquintanilha@hotmail.com',
      password: 'Gigi553518-+.#',
      email_confirm: true,
    });

    if (authError) {
      console.error("Erro ao criar usuário admin:", authError);
      throw authError;
    }

    // Vincular usuário à organização admin
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .insert({
        id: authUser.user.id,
        organization_id: '00000000-0000-0000-0000-000000000000',
        first_name: 'Admin',
        last_name: 'Sistema',
        role: 'admin',
        email: 'julioquintanilha@hotmail.com'
      })
      .select()
      .single();

    if (userError) {
      console.error("Erro ao inserir usuário no banco:", userError);
      throw userError;
    }

    return new Response(
      JSON.stringify({ 
        message: "Usuário admin criado com sucesso", 
        user: userData 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro na função:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
