
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { useToast } from "@/components/ui/use-toast";

interface OrganizationStats {
  customers: number;
  invoices: number;
  collections: number;
}

// Define a more proper typing for RPC function parameters and responses
interface RpcParams {
  org_id: string;
}

// Define an interface for the RPC response
interface RpcResponse {
  data: number | null;
  error: any;
}

export function useOrganizationDetails(id: string | undefined) {
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrganizationStats>({
    customers: 0,
    invoices: 0,
    collections: 0
  });

  const fetchOrganizationDetails = async (orgId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error) throw error;

      if (data) {
        const subscriptionStatus = data.subscription_status as Organization['subscriptionStatus'];
        const gateway = data.gateway as Organization['gateway'];
        
        const org: Organization = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          subscriptionStatus: subscriptionStatus || 'active',
          subscriptionDueDate: data.subscription_due_date,
          subscriptionAmount: data.subscription_amount,
          lastPaymentDate: data.last_payment_date,
          gateway: gateway || 'mercadopago',
          isAdmin: data.is_admin,
          blocked: data.blocked
        };
        setOrganization(org);

        await fetchStats(orgId);
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
      toast({
        title: "Error",
        description: "Could not load company details",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (orgId: string) => {
    try {
      // Define the parameters object
      const params: RpcParams = { org_id: orgId };
      
      // Call RPC functions with proper type annotations
      // Use any to bypass TypeScript constraints, then properly type the responses
      const { data: customersData, error: customersError } = await supabase.rpc('count_customers_by_org', params) as RpcResponse;
      const { data: invoicesData, error: invoicesError } = await supabase.rpc('count_invoices_by_org', params) as RpcResponse;
      const { data: collectionsData, error: collectionsError } = await supabase.rpc('count_collections_by_org', params) as RpcResponse;
      
      if (customersError) throw customersError;
      if (invoicesError) throw invoicesError;
      if (collectionsError) throw collectionsError;
      
      setStats({
        customers: customersData || 0,
        invoices: invoicesData || 0,
        collections: collectionsData || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats({
        customers: 0,
        invoices: 0,
        collections: 0
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails(id);
    }
  }, [id]);

  return { organization, loading, stats, fetchOrganizationDetails };
}
