import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types/organization";
import { Building, ArrowLeft, Users, CreditCard, Clock, Check, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const subscriptionSchema = z.object({
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0, 
    { message: "Value must be a positive number" }
  ),
  dueDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)), 
    { message: "Invalid date" }
  ),
  gateway: z.enum(["mercadopago", "asaas"])
});

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
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof subscriptionSchema>>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      amount: "",
      dueDate: "",
      gateway: "mercadopago"
    }
  });

  useEffect(() => {
    if (id) {
      fetchOrganizationDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (organization) {
      form.setValue("amount", organization.subscriptionAmount.toString());
      form.setValue("dueDate", organization.subscriptionDueDate.split('T')[0]);
      form.setValue("gateway", organization.gateway);
    }
  }, [organization, form]);

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
        const org: Organization = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          subscriptionStatus: data.subscription_status as 'active' | 'overdue' | 'canceled' | 'permanent',
          subscriptionDueDate: data.subscription_due_date,
          subscriptionAmount: data.subscription_amount,
          lastPaymentDate: data.last_payment_date,
          gateway: data.gateway as 'mercadopago' | 'asaas',
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
      const customersQuery = await supabase.rpc('count_customers_by_org', {
        org_id: orgId
      });
      
      if (customersQuery.data !== null) {
        setStats(prev => ({ ...prev, customers: customersQuery.data }));
      }
      
      const invoicesQuery = await supabase.rpc('count_invoices_by_org', {
        org_id: orgId
      });
      
      if (invoicesQuery.data !== null) {
        setStats(prev => ({ ...prev, invoices: invoicesQuery.data }));
      }
      
      const collectionsQuery = await supabase.rpc('count_collections_by_org', {
        org_id: orgId
      });
      
      if (collectionsQuery.data !== null) {
        setStats(prev => ({ ...prev, collections: collectionsQuery.data }));
      }
      
      if (customersQuery.error) console.error('Error counting customers:', customersQuery.error);
      if (invoicesQuery.error) console.error('Error counting invoices:', invoicesQuery.error);
      if (collectionsQuery.error) console.error('Error counting collections:', collectionsQuery.error);
      
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

  const updateSubscription = async (data: z.infer<typeof subscriptionSchema>) => {
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
        gateway: data.gateway as 'mercadopago' | 'asaas',
        blocked: false,
        subscriptionStatus: 'active'
      } : null);
      
      setDialogOpen(false);
      
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
        <Button variant="outline" onClick={() => navigate('/admin/organizations')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista de empresas
        </Button>
      </div>
    );
  }

  const isOverdue = new Date(organization.subscriptionDueDate) < new Date() && organization.subscriptionStatus === 'active';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/organizations')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        <Button variant={organization.blocked ? "default" : "destructive"} onClick={toggleBlockOrganization}>
          {organization.blocked ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Desbloquear
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Bloquear
            </>
          )}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle>{organization.name}</CardTitle>
                </div>
                {organization.blocked ? (
                  <Badge variant="destructive">Bloqueado</Badge>
                ) : isOverdue ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Atrasado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ativo
                  </Badge>
                )}
              </div>
              <CardDescription>{organization.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Cadastrado em</div>
                <div>{new Date(organization.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>
              
              {organization.phone && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Telefone</div>
                  <div>{organization.phone}</div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assinatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <Badge variant={organization.blocked ? "destructive" : isOverdue ? "outline" : "outline"} 
                       className={!organization.blocked && !isOverdue ? "bg-green-50 text-green-700 border-green-200" : 
                                 isOverdue ? "bg-amber-50 text-amber-700 border-amber-200" : ""}>
                  {organization.blocked 
                    ? "Bloqueado" 
                    : isOverdue 
                      ? "Atrasado" 
                      : "Ativo"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-muted-foreground">Próximo vencimento</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{format(new Date(organization.subscriptionDueDate), "dd/MM/yyyy")}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-muted-foreground">Valor mensal</div>
                <div className="font-medium">R$ {organization.subscriptionAmount.toFixed(2)}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-muted-foreground">Gateway</div>
                <Badge variant="outline">
                  {organization.gateway === "mercadopago" ? "Mercado Pago" : "Asaas"}
                </Badge>
              </div>
              
              {organization.lastPaymentDate && (
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-muted-foreground">Último pagamento</div>
                  <div>{format(new Date(organization.lastPaymentDate), "dd/MM/yyyy")}</div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Atualizar Assinatura</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Atualizar Assinatura</DialogTitle>
                    <DialogDescription>
                      Atualize os detalhes da assinatura para {organization.name}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(updateSubscription)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor Mensal (R$)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" step="0.01" min="0" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Vencimento</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gateway"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gateway de Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um gateway" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                                <SelectItem value="asaas">Asaas</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit">Salvar Alterações</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
        
        <div className="w-full md:w-2/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
              <CardDescription>Estatísticas e uso do sistema por esta empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <div className="text-sm font-medium text-blue-700">Clientes</div>
                  </div>
                  <div className="text-2xl font-bold">{stats.customers}</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                    <div className="text-sm font-medium text-green-700">Faturas</div>
                  </div>
                  <div className="text-2xl font-bold">{stats.invoices}</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-purple-500 mr-2" />
                    <div className="text-sm font-medium text-purple-700">Cobranças</div>
                  </div>
                  <div className="text-2xl font-bold">{stats.collections}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ações e Gerenciamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="actions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                  <TabsTrigger value="activity">Atividade</TabsTrigger>
                </TabsList>
                <TabsContent value="actions" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button className="w-full" onClick={() => window.open(`mailto:${organization.email}`)}>
                      Enviar Email
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      Acessar como Admin
                    </Button>
                    
                    <Button variant={organization.blocked ? "default" : "destructive"} className="w-full" onClick={toggleBlockOrganization}>
                      {organization.blocked ? "Desbloquear Empresa" : "Bloquear Empresa"}
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      Gerar Nova Fatura
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <div className="text-sm">
                        <span className="font-medium">Empresa criada</span> - {format(new Date(organization.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    
                    {organization.lastPaymentDate && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">Último pagamento</span> - {format(new Date(organization.lastPaymentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                      <div className="text-sm">
                        <span className="font-medium">Próxima cobrança</span> - {format(new Date(organization.subscriptionDueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
