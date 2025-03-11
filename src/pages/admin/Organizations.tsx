
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building, Search, Eye, MoreHorizontal, Check, X, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .is('deleted_at', null)
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const orgs: Organization[] = data.map(org => ({
          id: org.id,
          name: org.name,
          email: org.email,
          phone: org.phone,
          createdAt: org.created_at,
          updatedAt: org.updated_at,
          subscriptionStatus: org.subscription_status,
          subscriptionDueDate: org.subscription_due_date,
          subscriptionAmount: org.subscription_amount,
          lastPaymentDate: org.last_payment_date,
          gateway: org.gateway,
          isAdmin: org.is_admin,
          blocked: org.blocked
        }));
        setOrganizations(orgs);
      }
    } catch (error) {
      console.error('Erro ao buscar organizações:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockOrganization = async (orgId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ blocked: !currentStatus })
        .eq('id', orgId);

      if (error) throw error;

      setOrganizations(orgs => 
        orgs.map(org => 
          org.id === orgId ? { ...org, blocked: !currentStatus } : org
        )
      );
    } catch (error) {
      console.error('Erro ao alterar status da organização:', error);
    }
  };

  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as empresas cadastradas no sistema
          </p>
        </div>
        <div className="w-full md:w-auto flex gap-2 items-center">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresas..."
              className="pl-8 w-full md:w-[240px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl">Lista de Empresas</CardTitle>
          <CardDescription>
            {organizations.length} empresas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-8 text-center">Carregando empresas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrganizations.map((org) => {
                    const isOverdue = new Date(org.subscriptionDueDate) < new Date() && org.subscriptionStatus === 'active';
                    
                    return (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{org.name}</div>
                              <div className="text-sm text-muted-foreground">{org.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {org.blocked ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <X className="h-3 w-3" /> Bloqueado
                            </Badge>
                          ) : isOverdue ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" /> Atrasado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 w-fit">
                              <Check className="h-3 w-3" /> Ativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(org.createdAt), { 
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(org.subscriptionDueDate).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            R$ {org.subscriptionAmount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Mais ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link to={`/admin/organizations/${org.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalhes
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={() => toggleBlockOrganization(org.id, org.blocked)}>
                                {org.blocked ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2 text-green-500" />
                                    Desbloquear empresa
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-2 text-red-500" />
                                    Bloquear empresa
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
