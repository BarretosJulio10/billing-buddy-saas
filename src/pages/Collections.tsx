
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CollectionRuleTable } from "@/components/collections/CollectionRuleTable";
import { CollectionRuleForm } from "@/components/collections/CollectionRuleForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { WhatsAppQRScanner } from "@/components/integrations/WhatsAppQRScanner";
import { TelegramConnector } from "@/components/integrations/TelegramConnector";
import { PaymentGatewayForm } from "@/components/integrations/PaymentGatewayForm";

const Collections = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleAddRule = (data: any) => {
    // This will be integrated with Supabase later
    toast({
      title: "Modelo criado",
      description: "O novo modelo de cobrança foi criado com sucesso.",
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Régua de Cobrança</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Modelo
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>Novo Modelo de Cobrança</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <CollectionRuleForm 
                onSubmit={handleAddRule}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="models">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
          <TabsTrigger value="payment">Formas de Pagamento</TabsTrigger>
        </TabsList>
        <TabsContent value="models">
          <CollectionRuleTable />
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <div className="grid gap-6">
            <WhatsAppQRScanner apiEndpoint="/api/whatsapp/connect" />
            
            <Card>
              <CardHeader>
                <CardTitle>Configuração Avançada</CardTitle>
                <CardDescription>
                  Configure opções adicionais para o envio de mensagens via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL da API</label>
                    <Input placeholder="https://sua-api-whatsapp.com/send" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Token de Autenticação</label>
                    <Input type="password" placeholder="seu-token-secreto" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Número de Telefone</label>
                    <Input placeholder="5511999999999" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Salvar Configurações</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="telegram">
          <TelegramConnector />
        </TabsContent>
        
        <TabsContent value="payment">
          <div className="grid gap-6 md:grid-cols-2">
            <PaymentGatewayForm gateway="mercadopago" />
            <PaymentGatewayForm gateway="asaas" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Collections;
