
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Customer {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
}

export function useInvoiceData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, name')
          .eq('deleted_at', null)
          .eq('is_active', true)
          .order('name');
        
        if (customersError) throw customersError;
        
        // Fetch collection rules to use as templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('collection_rules')
          .select('id, name')
          .eq('deleted_at', null)
          .eq('is_active', true)
          .order('name');
        
        if (templatesError) throw templatesError;
        
        setCustomers(customersData || []);
        setTemplates(templatesData || []);
      } catch (error) {
        console.error('Error fetching invoice data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar clientes ou modelos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [toast]);
  
  return { customers, templates, isLoading };
}
