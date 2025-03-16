
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, Loader2 } from "lucide-react";
import { useWhatsAppInstance } from "@/hooks/whatsapp/useWhatsAppInstance";
import { WhatsAppLoading } from "./whatsapp/WhatsAppLoading";
import { WhatsAppCreateInstance } from "./whatsapp/WhatsAppCreateInstance";
import { WhatsAppConnect } from "./whatsapp/WhatsAppConnect";
import { WhatsAppConnectedView } from "./whatsapp/WhatsAppConnectedView";
import { useToast } from "@/components/ui/use-toast";

export function WhatsAppManager() {
  const { toast } = useToast();
  const { organizationId } = useOrganization();
  
  const {
    loading,
    refreshing,
    instance,
    error,
    step,
    isInstanceSaved,
    createInstance,
    connectWhatsApp,
    disconnectWhatsApp,
    refreshStatus,
  } = useWhatsAppInstance(organizationId);

  const handleSubmitInstance = async (values: { instanceName: string }) => {
    try {
      await createInstance(values.instanceName);
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar instância do WhatsApp. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  // Render appropriate content based on the current step
  const renderContent = () => {
    if (loading && step === 'check') {
      return <WhatsAppLoading />;
    }

    if (step === 'create') {
      return (
        <WhatsAppCreateInstance 
          defaultInstanceName={organizationId ? `org_${organizationId.substring(0, 8)}` : ""}
          loading={loading}
          error={error}
          onSubmit={handleSubmitInstance}
          isInstanceSaved={isInstanceSaved}
        />
      );
    }
    
    if (step === 'connect') {
      return (
        <WhatsAppConnect
          instance={instance}
          loading={loading}
          error={error}
          onConnect={connectWhatsApp}
        />
      );
    }
    
    if (step === 'connected' && instance) {
      return (
        <WhatsAppConnectedView
          instance={instance}
          loading={loading}
          error={error}
          onDisconnect={disconnectWhatsApp}
        />
      );
    }

    return null;
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Conecte sua conta do WhatsApp para enviar mensagens para seus clientes</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshStatus} 
            disabled={refreshing || loading}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {renderContent()}
    </Card>
  );
}
