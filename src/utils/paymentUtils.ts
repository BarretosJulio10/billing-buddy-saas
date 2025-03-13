
import { Organization } from "@/types/organization";
import { supabase } from "@/integrations/supabase/client";

export async function generatePaymentLink(organization: Organization): Promise<string> {
  try {
    // Check if the organization already has a payment link
    if (organization.paymentLink) {
      return organization.paymentLink;
    }
    
    // Depending on the gateway, create a payment link
    if (organization.gateway === 'mercadopago') {
      // In a real app, this would call a serverless function to create a Mercado Pago payment
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          organizationId: organization.id,
          amount: organization.subscriptionAmount
        }
      });
      
      if (error) throw error;
      return data.paymentLink;
    } else if (organization.gateway === 'asaas') {
      // Handle Asaas gateway
      const { data, error } = await supabase.functions.invoke('create-asaas-payment', {
        body: { 
          organizationId: organization.id,
          amount: organization.subscriptionAmount
        }
      });
      
      if (error) throw error;
      return data.paymentLink;
    } else {
      // Fallback to a generic page
      return `/payment/${organization.id}`;
    }
  } catch (error) {
    console.error("Error generating payment link:", error);
    // Fallback to a generic page
    return `/payment/${organization.id}`;
  }
}
