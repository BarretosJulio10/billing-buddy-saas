
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Constants for admin credentials
const ADMIN_EMAIL = 'julioquintanilha@hotmail.com';
const ADMIN_PASSWORD = 'Gigi553518-+.#';

// Creates a Supabase client with admin privileges
function createSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

// Finds or creates the admin organization
async function findOrCreateAdminOrganization(supabaseClient) {
  let { data: adminOrg, error: orgError } = await supabaseClient
    .from('organizations')
    .select('*')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle();

  if (orgError) {
    console.error("Error checking for admin organization:", orgError);
    throw orgError;
  }

  // If admin organization doesn't exist, create it
  if (!adminOrg) {
    console.log("Creating admin organization");
    const { data: newOrg, error: newOrgError } = await supabaseClient
      .from('organizations')
      .insert({
        name: 'Admin System',
        email: ADMIN_EMAIL,
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

  return adminOrg;
}

// Finds or creates the admin user in Auth
async function findOrCreateAdminUser(supabaseClient) {
  const { data: existingUsers, error: authFindError } = await supabaseClient.auth.admin.listUsers();

  if (authFindError) {
    console.error("Error checking for existing auth users:", authFindError);
    throw authFindError;
  }

  const adminUser = existingUsers?.users?.find(user => user.email === ADMIN_EMAIL);
  
  // If admin doesn't exist in auth, create it
  if (!adminUser) {
    console.log("Creating admin user in auth");
    const { data, error: createError } = await supabaseClient.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

    if (createError) {
      console.error("Error creating admin auth user:", createError);
      throw createError;
    }
    
    console.log("Admin auth user created:", data.user);
    return data.user;
  } else {
    // Reset password for admin user
    console.log("Resetting admin password");
    const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
      adminUser.id,
      { password: ADMIN_PASSWORD }
    );
    
    if (updateError) {
      console.error("Error updating admin password:", updateError);
      throw updateError;
    }
    
    console.log("Admin password reset successfully");
    return adminUser;
  }
}

// Links the admin user to the admin organization in the users table
async function linkAdminUserToOrganization(supabaseClient, authUser, adminOrg) {
  // Check if admin exists in users table
  const { data: existingUser, error: userFindError } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (userFindError) {
    console.error("Error checking existing user:", userFindError);
    throw userFindError;
  }

  // If admin doesn't exist in users table or has incorrect organization, update it
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
        email: ADMIN_EMAIL
      })
      .select()
      .single();

    if (userError) {
      console.error("Error inserting user in database:", userError);
      throw userError;
    }

    console.log("Admin user created in users table:", userData);
    return userData;
  } else if (existingUser.organization_id !== adminOrg.id) {
    // Update organization reference if needed
    console.log("Updating admin user organization reference");
    const { data: updatedUser, error: updateError } = await supabaseClient
      .from('users')
      .update({ organization_id: adminOrg.id })
      .eq('id', authUser.id)
      .select()
      .single();
      
    if (updateError) {
      console.error("Error updating user organization:", updateError);
      throw updateError;
    }
    
    console.log("Admin user organization updated:", updatedUser);
    return updatedUser;
  }

  console.log("Admin user already correctly linked to organization");
  return existingUser;
}

// Main handler function that orchestrates the admin user creation process
async function handleAdminUserCreation() {
  try {
    console.log("Starting admin user creation process");
    
    const supabaseClient = createSupabaseAdmin();
    const adminOrg = await findOrCreateAdminOrganization(supabaseClient);
    const authUser = await findOrCreateAdminUser(supabaseClient);
    const user = await linkAdminUserToOrganization(supabaseClient, authUser, adminOrg);

    console.log("Admin user verified and ready");
    return { 
      message: "Admin user verified and ready", 
      user 
    };
  } catch (error) {
    console.error("Admin user creation failed:", error);
    throw error;
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await handleAdminUserCreation();
    
    return new Response(
      JSON.stringify(result),
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
