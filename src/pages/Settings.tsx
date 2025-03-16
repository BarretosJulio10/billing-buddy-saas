
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WhatsAppManager } from "@/components/integrations/WhatsAppManager";
import { TelegramConnector } from "@/components/integrations/TelegramConnector";
import { PaymentGatewayForm } from "@/components/integrations/PaymentGatewayForm";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MessageSquare, CreditCard } from "lucide-react";

const Settings = () => {
  const [activeTabs, setActiveTabs] = useState({
    messaging: "whatsapp",
    payment: "mercadopago",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as integrações e configurações do sistema de mensalidades
        </p>
      </div>

      <Tabs defaultValue="messaging" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messaging">Mensagens</TabsTrigger>
          <TabsTrigger value="payment">Gateways de Pagamento</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        {/* Configurações de Mensagens */}
        <TabsContent value="messaging" className="space-y-4">
          <Tabs value={activeTabs.messaging} onValueChange={(value) => setActiveTabs({...activeTabs, messaging: value})}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Integrações de Mensagens</h2>
              <TabsList>
                <TabsTrigger value="whatsapp" className="flex gap-2 items-center">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="telegram" className="flex gap-2 items-center">
                  <MessageSquare className="h-4 w-4" />
                  Telegram
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="whatsapp" className="mt-4">
              <WhatsAppManager />
            </TabsContent>

            <TabsContent value="telegram" className="mt-4">
              <TelegramConnector 
                onSuccess={() => console.log("Telegram conectado com sucesso")}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Configurações de Gateways de Pagamento */}
        <TabsContent value="payment" className="space-y-4">
          <Tabs value={activeTabs.payment} onValueChange={(value) => setActiveTabs({...activeTabs, payment: value})}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gateways de Pagamento</h2>
              <TabsList>
                <TabsTrigger value="mercadopago" className="flex gap-2 items-center">
                  <CreditCard className="h-4 w-4" />
                  Mercado Pago
                </TabsTrigger>
                <TabsTrigger value="asaas" className="flex gap-2 items-center">
                  <CreditCard className="h-4 w-4" />
                  Asaas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="mercadopago" className="mt-4">
              <PaymentGatewayForm 
                gateway="mercadopago" 
                onSuccess={() => console.log("Mercado Pago configurado com sucesso")}
              />
            </TabsContent>

            <TabsContent value="asaas" className="mt-4">
              <PaymentGatewayForm 
                gateway="asaas" 
                onSuccess={() => console.log("Asaas configurado com sucesso")}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>
                Informações sobre a versão atual e configurações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Versão</h3>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <Badge variant="success">Ativo</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Último backup</h3>
                  <p className="text-sm text-muted-foreground">01/08/2023 14:30</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Mensagens enviadas (mês)</h3>
                  <p className="text-sm text-muted-foreground">1,254</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Clientes ativos</h3>
                  <p className="text-sm text-muted-foreground">523</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Faturas geradas (mês)</h3>
                  <p className="text-sm text-muted-foreground">845</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
