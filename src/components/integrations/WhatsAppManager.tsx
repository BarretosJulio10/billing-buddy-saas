
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useWhatsAppInstance } from "@/hooks/whatsapp/useWhatsAppInstance";
import { WhatsAppInstanceForm } from "./WhatsAppInstanceForm";
import { WhatsAppQRCode } from "./WhatsAppQRCode";
import { WhatsAppConnected } from "./WhatsAppConnected";

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

  // Render loading state
  if (loading && step === 'check') {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>Conecte sua conta do WhatsApp para enviar mensagens</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {step === 'create' && (
          <WhatsAppInstanceForm 
            defaultInstanceName={organizationId ? `org_${organizationId.substring(0, 8)}` : ""}
            loading={loading}
            onSubmit={handleSubmitInstance}
          />
        )}
        
        {step === 'connect' && (
          <WhatsAppQRCode
            qrCode={instance?.qrCode}
            loading={loading}
            onConnect={connectWhatsApp}
          />
        )}
        
        {step === 'connected' && instance && (
          <WhatsAppConnected
            instance={instance}
            loading={loading}
            onDisconnect={disconnectWhatsApp}
          />
        )}
      </CardContent>
    </Card>
  );
}
