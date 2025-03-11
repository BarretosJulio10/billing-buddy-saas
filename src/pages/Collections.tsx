
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        <TabsContent value="models">
          <CollectionRuleTable />
        </TabsContent>
        <TabsContent value="settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do WhatsApp</CardTitle>
                <CardDescription>
                  Configure a API não oficial do WhatsApp para envio de cobranças
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Endpoint da API
                    </label>
                    <Input placeholder="https://sua-api-whatsapp.com/send" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Token de Acesso
                    </label>
                    <Input type="password" placeholder="Seu token de acesso" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Conectar WhatsApp</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuração do Telegram</CardTitle>
                <CardDescription>
                  Configure o bot do Telegram para envio de cobranças
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Token do Bot
                    </label>
                    <Input type="password" placeholder="Seu token do bot" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      ID do Chat
                    </label>
                    <Input placeholder="ID do chat ou grupo" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Conectar Telegram</Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mercado Pago</CardTitle>
                <CardDescription>
                  Configure sua integração com o Mercado Pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Client ID
                    </label>
                    <Input placeholder="Seu Client ID" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Client Secret
                    </label>
                    <Input type="password" placeholder="Seu Client Secret" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Salvar Configurações</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asaas</CardTitle>
                <CardDescription>
                  Configure sua integração com o Asaas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      API Key
                    </label>
                    <Input type="password" placeholder="Sua API Key" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Ambiente
                    </label>
                    <Select defaultValue="sandbox">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Produção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Salvar Configurações</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Collections;
