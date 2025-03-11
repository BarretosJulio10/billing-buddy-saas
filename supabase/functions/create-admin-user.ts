
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

    // Check if admin user already exists
    const { data: existingAdmin, error: findError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', 'julioquintanilha@hotmail.com')
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error("Error checking existing user:", findError);
      throw findError;
    }

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ message: "Admin already exists", user: existingAdmin }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get admin organization
    const { data: adminOrg, error: orgError } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('email', 'julioquintanilha@hotmail.com')
      .single();

    if (orgError) {
      console.error("Error fetching admin organization:", orgError);
      throw orgError;
    }

    // Create admin user in auth
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email: 'julioquintanilha@hotmail.com',
      password: 'Gigi553518-+.#',
      email_confirm: true,
    });

    if (authError) {
      console.error("Error creating admin user:", authError);
      throw authError;
    }

    // Link user to admin organization
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .insert({
        id: authUser.user.id,
        organization_id: adminOrg.id,
        first_name: 'Admin',
        last_name: 'System',
        role: 'admin',
        email: 'julioquintanilha@hotmail.com'
      })
      .select()
      .single();

    if (userError) {
      console.error("Error inserting user in database:", userError);
      throw userError;
    }

    return new Response(
      JSON.stringify({ 
        message: "Admin user created successfully", 
        user: userData 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
