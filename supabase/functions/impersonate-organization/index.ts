
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // Get request body
    const { organizationId } = await req.json();
    
    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'Organization ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get user from organization with admin role to impersonate
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('role', 'admin')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No admin user found for this organization' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const userId = users[0].id;

    // Generate a new session for the admin user of the organization
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createUserSession(
      {
        userId: userId,
        properties: {
          is_impersonated: true
        }
      }
    );
    
    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Return the session token
    return new Response(
      JSON.stringify({
        token: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
