
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";

type Customer = {
  id: string;
  name: string;
  active: boolean;
  date: Date;
};

export function RecentCustomers() {
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization();

  useEffect(() => {
    async function fetchRecentCustomers() {
      if (!organization) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, is_active, created_at')
          .eq('organization_id', organization.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching recent customers:', error);
          return;
        }

        const formattedCustomers = data.map(customer => ({
          id: customer.id,
          name: customer.name,
          active: customer.is_active,
          date: new Date(customer.created_at),
        }));

        setRecentCustomers(formattedCustomers);
      } catch (error) {
        console.error('Error in fetchRecentCustomers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentCustomers();
  }, [organization]);

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Clientes Recentes</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            // Skeleton loading state
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : recentCustomers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Nenhum cliente recente encontrado
            </div>
          ) : (
            recentCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(customer.date, "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div>
                  {customer.active ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <Check className="h-3 w-3" /> Ativo
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <X className="h-3 w-3" /> Inativo
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
