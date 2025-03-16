
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL") || "https://evolution.pagoupix.com.br/";
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY") || "f4605620efebc20566233aae05d9ed39";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { action, instanceName, organizationId } = await req.json();
    console.log(`Received request: action=${action}, instance=${instanceName}, org=${organizationId || 'N/A'}`);

    switch (action) {
      case "create":
        return await handleCreateInstance(instanceName, organizationId);
      case "getQR":
        return await handleGetQR(instanceName);
      case "status":
        return await handleCheckStatus(instanceName);
      case "disconnect":
        return await handleDisconnect(instanceName);
      default:
        return Response.json(
          { success: false, message: "Ação não reconhecida" },
          { headers: corsHeaders, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return Response.json(
      { success: false, message: error.message || "Erro interno do servidor" },
      { headers: corsHeaders, status: 500 }
    );
  }
});

async function handleCreateInstance(instanceName: string, organizationId: string) {
  try {
    console.log(`Creating instance: ${instanceName}`);
    const response = await fetch(`${EVOLUTION_API_URL}instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        instanceName,
        webhook: `${Deno.env.get("SUPABASE_URL") || ""}/functions/v1/webhook-whatsapp`,
        webhookByEvents: true,
        qrcode: true,
      }),
    });

    const data = await response.json();
    console.log("API response:", JSON.stringify(data));

    if (!data.success) {
      return Response.json(
        { success: false, message: data.error || "Falha ao criar instância" },
        { headers: corsHeaders, status: 400 }
      );
    }

    return Response.json(
      { success: true, instanceName },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error creating instance:", error);
    return Response.json(
      { success: false, message: error.message || "Erro ao criar instância" },
      { headers: corsHeaders, status: 500 }
    );
  }
}

async function handleGetQR(instanceName: string) {
  try {
    console.log(`Getting QR for instance: ${instanceName}`);
    const response = await fetch(`${EVOLUTION_API_URL}instance/qrcode?instance=${instanceName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
    });

    const data = await response.json();
    console.log("QR code status:", data.success);

    if (!data.success) {
      return Response.json(
        { success: false, message: data.error || "QR code não disponível" },
        { headers: corsHeaders, status: 400 }
      );
    }

    // Update the qrcode in the database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    await supabase
      .from("whatsapp_instances")
      .update({ qrcode: data.qrcode })
      .eq("instance_name", instanceName);

    return Response.json(
      { success: true, qrcode: data.qrcode },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error getting QR code:", error);
    return Response.json(
      { success: false, message: error.message || "Erro ao obter QR code" },
      { headers: corsHeaders, status: 500 }
    );
  }
}

async function handleCheckStatus(instanceName: string) {
  try {
    console.log(`Checking status for instance: ${instanceName}`);
    const response = await fetch(`${EVOLUTION_API_URL}instance/connectionState?instance=${instanceName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
    });

    const data = await response.json();
    console.log("Status response:", JSON.stringify(data));

    // Verificar se a instância existe
    if (data.error && data.error.includes("not exist")) {
      return Response.json(
        { success: false, connected: false, message: "A instância não existe" },
        { headers: corsHeaders, status: 404 }
      );
    }

    // Verificar o estado de conexão
    const connected = data.state === "open";
    
    // Se estiver conectado, obter o número
    let number = null;
    if (connected) {
      const profileResponse = await fetch(`${EVOLUTION_API_URL}instance/fetchInstances`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": EVOLUTION_API_KEY,
        },
      });
      
      const profileData = await profileResponse.json();
      const instanceData = profileData.find(inst => inst.instance === instanceName);
      if (instanceData) {
        number = instanceData.owner;
      }
      
      // Atualizar o número no banco de dados
      if (number) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") || "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
        );
        
        await supabase
          .from("whatsapp_instances")
          .update({ 
            number,
            status: connected ? "connected" : "disconnected"
          })
          .eq("instance_name", instanceName);
      }
    }

    return Response.json(
      { 
        success: true, 
        connected,
        number,
        state: data.state 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error checking status:", error);
    return Response.json(
      { success: false, connected: false, message: error.message || "Erro ao verificar status" },
      { headers: corsHeaders, status: 500 }
    );
  }
}

async function handleDisconnect(instanceName: string) {
  try {
    console.log(`Disconnecting instance: ${instanceName}`);
    const response = await fetch(`${EVOLUTION_API_URL}instance/logout?instance=${instanceName}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
    });

    const data = await response.json();
    console.log("Logout response:", JSON.stringify(data));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    await supabase
      .from("whatsapp_instances")
      .update({ 
        status: "disconnected",
        qrcode: null,
        number: null
      })
      .eq("instance_name", instanceName);

    return Response.json(
      { success: true, message: "Desconectado com sucesso" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error disconnecting:", error);
    return Response.json(
      { success: false, message: error.message || "Erro ao desconectar" },
      { headers: corsHeaders, status: 500 }
    );
  }
}
