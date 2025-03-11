
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { useToast } from "@/components/ui/use-toast";

interface OrganizationStats {
  customers: number;
  invoices: number;
  collections: number;
}

type CountFunctionName = 'count_customers_by_org' | 'count_invoices_by_org' | 'count_collections_by_org';

interface RpcParams {
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
        const org: Organization = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          subscriptionStatus: data.subscription_status || 'active',
          subscriptionDueDate: data.subscription_due_date,
          subscriptionAmount: data.subscription_amount,
          lastPaymentDate: data.last_payment_date,
          gateway: data.gateway || 'mercadopago',
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
      const fetchSingleStat = async (functionName: CountFunctionName): Promise<number> => {
        const { data, error } = await supabase.rpc<number, RpcParams>(
          functionName,
          { org_id: orgId }
        );
        
        if (error) throw error;
        return typeof data === 'number' ? data : 0;
      };

      const [customers, invoices, collections] = await Promise.all([
        fetchSingleStat('count_customers_by_org'),
        fetchSingleStat('count_invoices_by_org'),
        fetchSingleStat('count_collections_by_org')
      ]);
      
      setStats({ customers, invoices, collections });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStats({ customers: 0, invoices: 0, collections: 0 });
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails(id);
    }
  }, [id]);

  return { organization, loading, stats, fetchOrganizationDetails };
}
