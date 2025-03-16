
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "https://evolution.pagoupix.com.br";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "f4605620efebc20566233aae05d9ed39";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { action, instanceName, organizationId } = await req.json();

    console.log(`Processing ${action} request for instance: ${instanceName}`);

    switch (action) {
      case "create":
        return await createInstance(supabase, instanceName, organizationId);
      case "getQR":
        return await getQRCode(instanceName);
      case "status":
        return await checkStatus(instanceName);
      case "disconnect":
        return await disconnectInstance(instanceName);
      default:
        return new Response(
          JSON.stringify({ success: false, message: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error in whatsapp-connector:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function createInstance(supabase, instanceName, organizationId) {
  // First, save instance in Supabase
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .insert({
      instance_name: instanceName,
      organization_id: organizationId,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving instance to database:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Then, create instance in Evolution API
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers: {
        "apikey": EVOLUTION_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        instanceName,
        token: organizationId,
        qrcode: true,
        webhook: {
          url: "",
          enabled: false
        }
      })
    });

    const result = await response.json();
    console.log("Evolution API response:", result);

    if (!result.success) {
      throw new Error(result.error || "Failed to create instance");
    }

    return new Response(
      JSON.stringify({ success: true, instanceName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating instance in Evolution API:", error);
    
    // Cleanup the database entry if the API call fails
    await supabase
      .from("whatsapp_instances")
      .delete()
      .eq("instance_name", instanceName);
      
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function getQRCode(instanceName) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/qrcode/${instanceName}?image=true`, {
      method: "GET",
      headers: {
        "apikey": EVOLUTION_API_KEY,
      }
    });

    const result = await response.json();

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, message: result.message || "QR code not available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, qrcode: result.qrcode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error getting QR code:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function checkStatus(instanceName) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      method: "GET",
      headers: {
        "apikey": EVOLUTION_API_KEY,
      }
    });

    const result = await response.json();
    console.log("Connection state result:", result);

    const isConnected = result.state === "open";

    return new Response(
      JSON.stringify({ 
        success: true, 
        connected: isConnected,
        number: result.number || null,
        state: result.state
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking connection state:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function disconnectInstance(instanceName) {
  try {
    const response = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, {
      method: "DELETE",
      headers: {
        "apikey": EVOLUTION_API_KEY,
      }
    });

    const result = await response.json();

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, message: result.error || "Failed to disconnect" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "WhatsApp disconnected successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error disconnecting instance:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
