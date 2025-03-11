
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { useToast } from "@/components/ui/use-toast";

interface OrganizationStats {
  customers: number;
  invoices: number;
  collections: number;
}

// Define the shape of the RPC response
interface StatResponse {
  count: number;
}

// Define the type for the RPC function name and params
type FunctionName = 'count_customers_by_org' | 'count_invoices_by_org' | 'count_collections_by_org';
interface OrgIdParam {
  org_id: string;
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
        .select()
        .eq('id', orgId)
        .maybeSingle();

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
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (orgId: string) => {
    try {
      const customers = await fetchSingleStat('count_customers_by_org', orgId);
      const invoices = await fetchSingleStat('count_invoices_by_org', orgId);
      const collections = await fetchSingleStat('count_collections_by_org', orgId);
      
      setStats({ customers, invoices, collections });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats({ customers: 0, invoices: 0, collections: 0 });
    }
  };

  const fetchSingleStat = async (functionName: FunctionName, orgId: string): Promise<number> => {
    try {
      // Correctly type the RPC call with both the return type and params type
      const { data, error } = await supabase.rpc<StatResponse, OrgIdParam>(
        functionName, 
        { org_id: orgId }
      );
      
      if (error) throw error;
      
      return data?.count || 0;
    } catch (error) {
      console.error(`Error in ${functionName}:`, error);
      return 0;
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails(id);
    }
  }, [id]);

  return { organization, loading, stats, fetchOrganizationDetails };
}
