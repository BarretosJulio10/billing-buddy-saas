
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Modelos de Cobrança</CardTitle>
          <CardDescription>
            Gerencie os modelos e regras para envio automático de mensagens de cobrança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Os modelos definem quando e como as mensagens serão enviadas aos clientes. Configure lembretes antes do vencimento, 
            notificações no dia e cobranças após o vencimento.
          </p>
          <CollectionRuleTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instruções de Uso</CardTitle>
          <CardDescription>Como utilizar a régua de cobrança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Criando um modelo</h3>
            <p className="text-sm text-muted-foreground">
              Clique em "Novo Modelo" para criar uma nova régua de cobrança. Defina um nome, 
              configure os dias de envio e personalize as mensagens.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Variáveis disponíveis</h3>
            <p className="text-sm text-muted-foreground">
              Você pode usar as seguintes variáveis nas mensagens:
            </p>
            <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
              <li>{'{cliente}'} - Nome do cliente</li>
              <li>{'{valor}'} - Valor da fatura</li>
              <li>{'{dias_para_vencer}'} - Dias até o vencimento</li>
              <li>{'{dias_atraso}'} - Dias de atraso</li>
              <li>{'{link}'} - Link de pagamento</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Configurando integrações</h3>
            <p className="text-sm text-muted-foreground">
              Para que as mensagens sejam enviadas, configure as integrações de WhatsApp, Telegram e 
              gateways de pagamento na página de Configurações.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Collections;
