
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

    console.log("Starting admin user creation process");

    // Check for admin organization
    let { data: adminOrg, error: orgError } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('email', 'julioquintanilha@hotmail.com')
      .maybeSingle();

    // If admin organization doesn't exist, create it
    if (!adminOrg) {
      console.log("Creating admin organization");
      const { data: newOrg, error: newOrgError } = await supabaseClient
        .from('organizations')
        .insert({
          name: 'Admin System',
          email: 'julioquintanilha@hotmail.com',
          is_admin: true,
          subscription_status: 'permanent',
          subscription_due_date: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0],
          gateway: 'mercadopago',
          blocked: false
        })
        .select()
        .single();

      if (newOrgError) {
        console.error("Error creating admin organization:", newOrgError);
        throw newOrgError;
      }
      
      adminOrg = newOrg;
      console.log("Admin organization created:", adminOrg);
    } else {
      console.log("Found existing admin organization:", adminOrg);
    }

    // Check if admin user exists in auth
    const { data: existingUsers, error: authFindError } = await supabaseClient.auth.admin.listUsers();

    if (authFindError) {
      console.error("Error checking for existing auth users:", authFindError);
      throw authFindError;
    }

    const adminUser = existingUsers?.users?.find(user => user.email === 'julioquintanilha@hotmail.com');
    
    // If admin doesn't exist in auth, create it
    let authUser;
    if (!adminUser) {
      console.log("Creating admin user in auth");
      const { data, error: createError } = await supabaseClient.auth.admin.createUser({
        email: 'julioquintanilha@hotmail.com',
        password: 'Gigi553518-+.#',
        email_confirm: true,
      });

      if (createError) {
        console.error("Error creating admin auth user:", createError);
        throw createError;
      }
      
      authUser = data.user;
      console.log("Admin auth user created:", authUser);
    } else {
      authUser = adminUser;
      
      // Reset password for admin user
      console.log("Resetting admin password");
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        authUser.id,
        { password: 'Gigi553518-+.#' }
      );
      
      if (updateError) {
        console.error("Error updating admin password:", updateError);
        throw updateError;
      }
      
      console.log("Admin password reset successfully");
    }

    // Check if admin exists in users table
    const { data: existingUser, error: userFindError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', 'julioquintanilha@hotmail.com')
      .maybeSingle();

    if (userFindError && userFindError.code !== 'PGRST116') {
      console.error("Error checking existing user:", userFindError);
      throw userFindError;
    }

    // If admin doesn't exist in users table, create it
    if (!existingUser) {
      console.log("Creating admin in users table");
      const { data: userData, error: userError } = await supabaseClient
        .from('users')
        .insert({
          id: authUser.id,
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

      console.log("Admin user created in users table:", userData);

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
    }

    console.log("Admin user verified and updated");
    return new Response(
      JSON.stringify({ 
        message: "Admin user verified and updated", 
        user: existingUser 
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
