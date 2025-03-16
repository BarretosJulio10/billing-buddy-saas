
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, Loader2 } from "lucide-react";
import { useWhatsAppInstance } from "@/hooks/whatsapp/useWhatsAppInstance";
import { WhatsAppLoading } from "./whatsapp/WhatsAppLoading";
import { WhatsAppCreateInstance } from "./whatsapp/WhatsAppCreateInstance";
import { WhatsAppConnect } from "./whatsapp/WhatsAppConnect";
import { WhatsAppConnectedView } from "./whatsapp/WhatsAppConnectedView";

export function WhatsAppManager() {
  const { organizationId } = useOrganization();
  
  const {
    loading,
    refreshing,
    instance,
    error,
    step,
    createInstance,
    connectWhatsApp,
    disconnectWhatsApp,
    refreshStatus,
  } = useWhatsAppInstance(organizationId);

  const handleSubmitInstance = async (values: { instanceName: string }) => {
    await createInstance(values.instanceName);
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
            <CardDescription>Conecte sua conta do WhatsApp para enviar mensagens</CardDescription>
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
