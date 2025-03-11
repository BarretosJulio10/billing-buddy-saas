
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface OrganizationContextType {
  updateOrganizationDetails: (data: {
    name?: string;
    phone?: string;
  }) => Promise<void>;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const { organization, refetchUserData } = useAuth();
  const { toast } = useToast();

  const updateOrganizationDetails = async (data: { name?: string; phone?: string }) => {
    if (!organization) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('organizations')
        .update({
          name: data.name,
          phone: data.phone,
        })
        .eq('id', organization.id);
        
      if (error) throw error;
      
      // Atualizar dados do contexto
      await refetchUserData();
      
      toast({
        title: "Dados atualizados",
        description: "Os dados da empresa foram atualizados com sucesso",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar dados da organização:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    updateOrganizationDetails,
    loading,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
