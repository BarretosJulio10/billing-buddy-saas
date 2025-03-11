
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building, Users, CreditCard, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  blockedOrganizations: number;
  overdueOrganizations: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    blockedOrganizations: 0,
    overdueOrganizations: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total organizations
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('*', { count: 'exact' })
          .is('deleted_at', null)
          .eq('is_admin', false);

        if (orgsError) throw orgsError;

        // Filter for different statuses
        const active = orgs?.filter(org => org.subscription_status === 'active' && !org.blocked).length || 0;
        const blocked = orgs?.filter(org => org.blocked).length || 0;
        const overdue = orgs?.filter(org => 
          new Date(org.subscription_due_date) < new Date() && 
          org.subscription_status === 'active'
        ).length || 0;

        // Calculate total revenue (simulated)
        const totalAmount = orgs?.reduce((sum, org) => sum + (org.subscription_amount || 0), 0) || 0;

        setStats({
          totalOrganizations: orgs?.length || 0,
          activeOrganizations: active,
          blockedOrganizations: blocked,
          overdueOrganizations: overdue,
          totalRevenue: totalAmount
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Carregando estatísticas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
        <Link to="/admin/organizations">
          <Button className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Ver Todas Empresas
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Building className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Empresas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold">{stats.activeOrganizations}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Empresas Bloqueadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <div className="text-2xl font-bold">{stats.blockedOrganizations}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-purple-500 mr-2" />
              <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
          <CardDescription>
            Estatísticas e informações sobre as empresas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-amber-50 p-4 rounded-md flex items-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-amber-700">Empresas com Pagamento Atrasado</div>
                <div className="text-2xl font-bold">{stats.overdueOrganizations}</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-blue-700">Taxa de Conversão</div>
                <div className="text-2xl font-bold">
                  {stats.totalOrganizations > 0 
                    ? Math.round((stats.activeOrganizations / stats.totalOrganizations) * 100) 
                    : 0}%
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-md flex items-center">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-sm font-medium text-green-700">Empresas Ativas</div>
                <div className="text-2xl font-bold">{stats.activeOrganizations}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
