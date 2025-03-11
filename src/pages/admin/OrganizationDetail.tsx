
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { useToast } from "@/components/ui/use-toast";
import { OrganizationHeader } from "./components/OrganizationHeader";
import { OrganizationInfo } from "./components/OrganizationInfo";
import { SubscriptionDetails } from "./components/SubscriptionDetails";
import { OrganizationStats } from "./components/OrganizationStats";
import { OrganizationActions } from "./components/OrganizationActions";

export default function AdminOrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: 0,
    invoices: 0,
    collections: 0
  });

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails(id);
    }
  }, [id]);

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
      navigate('/admin/organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (orgId: string) => {
    try {
      // Fix type issues by using the correct type annotations for our RPC calls
      // We need to use any here because the Supabase TypeScript types don't know about our custom RPCs
      const { data: customersCount, error: customersError } = await supabase.rpc(
        'count_customers_by_org', 
        { org_id: orgId }
      );
      
      const { data: invoicesCount, error: invoicesError } = await supabase.rpc(
        'count_invoices_by_org', 
        { org_id: orgId }
      );
      
      const { data: collectionsCount, error: collectionsError } = await supabase.rpc(
        'count_collections_by_org', 
        { org_id: orgId }
      );
      
      if (customersError) console.error('Error counting customers:', customersError);
      if (invoicesError) console.error('Error counting invoices:', invoicesError);
      if (collectionsError) console.error('Error counting collections:', collectionsError);
      
      setStats({
        customers: customersCount || 0,
        invoices: invoicesCount || 0,
        collections: collectionsCount || 0
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

  const toggleBlockOrganization = async () => {
    if (!organization) return;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ blocked: !organization.blocked })
        .eq('id', organization.id);

      if (error) throw error;

      setOrganization(prev => prev ? { ...prev, blocked: !prev.blocked } : null);
      
      toast({
        title: organization.blocked ? "Company unblocked" : "Company blocked",
        description: organization.blocked 
          ? "The company has been successfully unblocked" 
          : "The company has been successfully blocked",
      });
    } catch (error) {
      console.error('Error changing organization status:', error);
      toast({
        title: "Error",
        description: "Could not change company status",
        variant: "destructive"
      });
    }
  };

  const updateSubscription = async (data: any) => {
    if (!organization) return;
    
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          subscription_amount: Number(data.amount),
          subscription_due_date: data.dueDate,
          gateway: data.gateway,
          blocked: false,
          subscription_status: 'active'
        })
        .eq('id', organization.id);

      if (error) throw error;

      setOrganization(prev => prev ? {
        ...prev,
        subscriptionAmount: Number(data.amount),
        subscriptionDueDate: data.dueDate,
        gateway: data.gateway,
        blocked: false,
        subscriptionStatus: 'active'
      } : null);
      
      toast({
        title: "Subscription updated",
        description: "Subscription data has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Could not update subscription data",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando detalhes da empresa...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium">Empresa não encontrada</h2>
        <p className="text-muted-foreground mb-4">Não foi possível encontrar os detalhes desta empresa</p>
      </div>
    );
  }

  const isOverdue = new Date(organization.subscriptionDueDate) < new Date() && organization.subscriptionStatus === 'active';

  return (
    <div className="space-y-6">
      <OrganizationHeader 
        organization={organization}
        onToggleBlock={toggleBlockOrganization}
      />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <OrganizationInfo 
            organization={organization}
            isOverdue={isOverdue}
          />
          
          <SubscriptionDetails 
            organization={organization}
            isOverdue={isOverdue}
            onUpdateSubscription={updateSubscription}
          />
        </div>
        
        <div className="w-full md:w-2/3 space-y-6">
          <OrganizationStats stats={stats} />
          <OrganizationActions 
            organization={organization}
            onToggleBlock={toggleBlockOrganization}
          />
        </div>
      </div>
    </div>
  );
}
