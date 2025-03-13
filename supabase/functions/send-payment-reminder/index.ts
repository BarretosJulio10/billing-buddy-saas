
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { MercadoPagoConfig, Payment } from "https://esm.sh/mercadopago@2.0.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Organization {
  id: string;
  name: string;
  email: string;
  gateway: string;
  subscriptionDueDate: string;
  subscriptionAmount: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') || '';
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // Get organizations with due dates approaching (5 days)
    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);
    const targetDate = fiveDaysFromNow.toISOString().split('T')[0];
    
    const { data: organizations, error: orgsError } = await supabaseAdmin
      .from('organizations')
      .select('id, name, email, gateway, subscription_due_date, subscription_amount')
      .eq('subscription_status', 'active')
      .eq('blocked', false)
      .eq('subscription_due_date', targetDate);
    
    if (orgsError) {
      console.error("Error fetching organizations:", orgsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch organizations' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Found ${organizations?.length || 0} organizations with upcoming payments`);
    
    if (!organizations || organizations.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No organizations need payment reminders today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Setup Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const payment = new Payment(client);

    // Process each organization
    for (const org of organizations) {
      try {
        // Create a payment for the organization
        const orgData: Organization = {
          id: org.id,
          name: org.name,
          email: org.email,
          gateway: org.gateway,
          subscriptionDueDate: org.subscription_due_date,
          subscriptionAmount: org.subscription_amount
        };

        if (orgData.gateway === 'mercadopago') {
          // Create a Mercado Pago payment
          const paymentResult = await payment.create({
            transaction_amount: orgData.subscriptionAmount,
            description: `Assinatura mensal ${orgData.name}`,
            payment_method_id: 'pix',
            payer: {
              email: orgData.email,
            },
            notification_url: `${supabaseUrl}/functions/v1/handle-payment-webhook`,
          });

          console.log(`Payment created for ${orgData.name}:`, paymentResult);

          // Update organization with payment details
          const { error: updateError } = await supabaseAdmin
            .from('organizations')
            .update({
              payment_link: paymentResult.point_of_interaction?.transaction_data?.qr_code_base64 || null,
              payment_id: paymentResult.id.toString()
            })
            .eq('id', orgData.id);
          
          if (updateError) {
            console.error(`Error updating payment details for ${orgData.name}:`, updateError);
            results.push({
              organization: orgData.name,
              status: 'error',
              message: 'Failed to update payment details'
            });
            continue;
          }

          // Send payment notification email (simplified - would use a real email service)
          console.log(`Sending payment reminder email to ${orgData.email}`);
          
          results.push({
            organization: orgData.name,
            status: 'success',
            message: 'Payment reminder sent'
          });
        } else {
          // Handle other payment gateways
          results.push({
            organization: orgData.name,
            status: 'skipped',
            message: 'Unsupported payment gateway'
          });
        }
      } catch (orgError) {
        console.error(`Error processing organization ${org.name}:`, orgError);
        results.push({
          organization: org.name,
          status: 'error',
          message: orgError.message || 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Payment reminders processed',
        results 
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
