
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req: Request) => {
  try {
    const body = await req.json();
    console.log("Received webhook:", JSON.stringify(body));
    
    // Processar apenas eventos relevantes
    if (!body.instance || !body.event) {
      return new Response("Missing instance or event", { status: 400 });
    }
    
    const instanceName = body.instance;
    const event = body.event;
    let status = null;
    let number = null;
    
    // Mapear eventos para status
    switch (event) {
      case "connection.update":
        if (body.data?.state === "open") {
          status = "connected";
          number = body.data?.phoneNumber || body.data?.owner;
        } else if (body.data?.state === "close") {
          status = "disconnected";
        }
        break;
      
      case "qrcode.updated":
        status = "connecting";
        // Atualizar o QR code
        if (body.data?.qrcode) {
          await supabase.rpc(
            'update_whatsapp_instance_status',
            { 
              instance_name_param: instanceName,
              status_param: 'connecting',
              qrcode_param: body.data.qrcode
            }
          );
        }
        break;
        
      case "connection.authenticated":
        status = "connected";
        number = body.data?.phoneNumber || body.data?.owner;
        break;
    }
    
    // Atualizar o status da instância se houver alguma mudança
    if (status) {
      console.log(`Updating instance ${instanceName} status to ${status}`);
      await supabase.rpc(
        'update_whatsapp_instance_status',
        { 
          instance_name_param: instanceName,
          status_param: status,
          number_param: number
        }
      );
    }
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(error.message, { status: 500 });
  }
});
