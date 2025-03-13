
import { supabase } from "@/integrations/supabase/client";

// Função para enviar lembretes de pagamento 5 dias antes do vencimento
export async function sendPaymentReminders() {
  try {
    // Chamar a edge function que envia os lembretes
    const { data, error } = await supabase.functions.invoke('send-payment-reminder');
    
    if (error) {
      console.error('Error sending payment reminders:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error executing payment reminder cron job:', error);
    return { success: false, error };
  }
}

// Função para verificar e atualizar status de assinaturas vencidas
export async function updateSubscriptionStatuses() {
  try {
    // Esta função verifica todas as assinaturas e marca como 'overdue' aquelas que venceram
    const { data, error } = await supabase
      .from('organizations')
      .update({ 
        subscription_status: 'overdue',
        blocked: true 
      })
      .lt('subscription_due_date', new Date().toISOString().split('T')[0])
      .eq('subscription_status', 'active')
      .select();
    
    if (error) {
      console.error('Error updating subscription statuses:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error executing subscription status cron job:', error);
    return { success: false, error };
  }
}

// Esta função seria chamada por um serviço de cron externo ou um script em um servidor
export async function executeDailyCronJobs() {
  await sendPaymentReminders();
  await updateSubscriptionStatuses();
}
