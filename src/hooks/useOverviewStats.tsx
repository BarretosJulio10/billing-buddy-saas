
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OverviewStatsData {
  totalCustomers: number;
  openInvoices: number;
  overdueInvoices: number;
  totalReceived: number;
  conversionRate: number;
  messagesSent: number;
  customerChange: number;
  invoiceChange: number;
  overdueChange: number;
  receivedChange: number;
  conversionChange: number;
  messagesChange: number;
}

export function useOverviewStats(organizationId: string | null) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStatsData>({
    totalCustomers: 0,
    openInvoices: 0,
    overdueInvoices: 0,
    totalReceived: 0,
    conversionRate: 0,
    messagesSent: 0,
    customerChange: 0,
    invoiceChange: 0,
    overdueChange: 0,
    receivedChange: 0,
    conversionChange: 0,
    messagesChange: 0
  });

  useEffect(() => {
    async function fetchStats() {
      if (!organizationId) return;
      
      try {
        setLoading(true);
        
        // Get total active customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, created_at')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .is('deleted_at', null);
        
        if (customersError) throw customersError;
        
        // Count customers created in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCustomers = customersData?.filter(
          customer => new Date(customer.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Get open invoices
        const { data: openInvoicesData, error: openInvoicesError } = await supabase
          .from('invoices')
          .select('id, created_at')
          .eq('organization_id', organizationId)
          .eq('status', 'pending')
          .is('deleted_at', null);
        
        if (openInvoicesError) throw openInvoicesError;
        
        // Count invoices created in the last 30 days
        const recentInvoices = openInvoicesData?.filter(
          invoice => new Date(invoice.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Get overdue invoices
        const { data: overdueInvoicesData, error: overdueInvoicesError } = await supabase
          .from('invoices')
          .select('id, created_at')
          .eq('organization_id', organizationId)
          .eq('status', 'overdue')
          .is('deleted_at', null);
        
        if (overdueInvoicesError) throw overdueInvoicesError;
        
        // Count overdue invoices in the last 30 days
        const recentOverdueInvoices = overdueInvoicesData?.filter(
          invoice => new Date(invoice.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Get paid invoices
        const { data: paidInvoicesData, error: paidInvoicesError } = await supabase
          .from('invoices')
          .select('id, amount, paid_at')
          .eq('organization_id', organizationId)
          .eq('status', 'paid')
          .is('deleted_at', null);
        
        if (paidInvoicesError) throw paidInvoicesError;
        
        // Calculate total received amount
        const totalReceived = paidInvoicesData?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0;
        
        // Count paid invoices in the last 30 days
        const recentPaidInvoices = paidInvoicesData?.filter(
          invoice => invoice.paid_at && new Date(invoice.paid_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Calculate conversion rate (paid / total)
        const totalInvoices = (openInvoicesData?.length || 0) + (overdueInvoicesData?.length || 0) + (paidInvoicesData?.length || 0);
        const conversionRate = totalInvoices > 0 ? (paidInvoicesData?.length || 0) / totalInvoices * 100 : 0;
        
        // Get messages sent
        const { data: messagesData, error: messagesError } = await supabase
          .from('message_history')
          .select('id, created_at')
          .eq('organization_id', organizationId)
          .eq('status', 'sent');
        
        if (messagesError) throw messagesError;
        
        // Count messages sent in the last 30 days
        const recentMessages = messagesData?.filter(
          message => new Date(message.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        // Calculate change percentages
        const customerChange = customersData?.length ? (recentCustomers / customersData.length) * 100 : 0;
        const invoiceChange = openInvoicesData?.length ? (recentInvoices / openInvoicesData.length) * 100 : 0;
        const overdueChange = overdueInvoicesData?.length ? (recentOverdueInvoices / overdueInvoicesData.length) * 100 : 0;
        const receivedChange = paidInvoicesData?.length ? (recentPaidInvoices / paidInvoicesData.length) * 100 : 0;
        const conversionChange = 0; // Would need historical data
        const messagesChange = messagesData?.length ? (recentMessages / messagesData.length) * 100 : 0;
        
        setStats({
          totalCustomers: customersData?.length || 0,
          openInvoices: openInvoicesData?.length || 0,
          overdueInvoices: overdueInvoicesData?.length || 0,
          totalReceived: totalReceived || 0,
          conversionRate: conversionRate || 0,
          messagesSent: messagesData?.length || 0,
          customerChange: Math.round(customerChange),
          invoiceChange: Math.round(invoiceChange),
          overdueChange: Math.round(overdueChange * -1), // negative change is positive for overdue
          receivedChange: Math.round(receivedChange),
          conversionChange: Math.round(conversionChange),
          messagesChange: Math.round(messagesChange)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [organizationId]);

  return { stats, loading };
}
