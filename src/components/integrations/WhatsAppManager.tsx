
import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { messagingUtils, WhatsAppInstance } from "@/utils/messagingUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, PhoneOff, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Form schema for instance creation
const instanceFormSchema = z.object({
  instanceName: z.string()
    .min(3, "Nome da instância deve ter no mínimo 3 caracteres")
    .max(30, "Nome da instância deve ter no máximo 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e underscores"),
});

type InstanceFormValues = z.infer<typeof instanceFormSchema>;

export function WhatsAppManager() {
  const { organizationId } = useOrganization();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [instance, setInstance] = useState<WhatsAppInstance | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [qrPollingActive, setQrPollingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'check' | 'create' | 'connect' | 'connected'>('check');

  // Instance creation form
  const form = useForm<InstanceFormValues>({
    resolver: zodResolver(instanceFormSchema),
    defaultValues: {
      instanceName: organizationId ? `org_${organizationId.substring(0, 8)}` : "",
    },
  });

  // Initial check on component mount
  useEffect(() => {
    if (organizationId) {
      checkInstanceStatus();
    } else {
      setError("ID da organização não disponível. Por favor, recarregue a página.");
    }
  }, [organizationId]);

  // Poll for QR code updates when connecting
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (qrPollingActive && instance?.status === 'connecting') {
      interval = setInterval(() => {
        fetchQRCode();
        checkInstanceStatus();
      }, 10000); // Poll every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrPollingActive, instance?.status]);

  const checkInstanceStatus = async () => {
    if (!organizationId) {
      setError("ID da organização não disponível. Por favor, recarregue a página.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First check if there's a stored instance name for this organization
      const instanceSettings = await messagingUtils.getWhatsAppInstanceSettings(organizationId);
      console.log("Instance settings:", instanceSettings);
      
      if (instanceSettings.success && instanceSettings.instanceName) {
        const instanceName = instanceSettings.instanceName;
        form.setValue('instanceName', instanceName);
        
        // Now check the connection status for this instance
        const connectionResult = await messagingUtils.checkWhatsAppConnection(instanceName);
        console.log("Connection result:", connectionResult);
        
        if (connectionResult.success) {
          setInstance({
            instanceName,
            status: connectionResult.connected ? 'connected' : 'disconnected',
            number: connectionResult.number
          });
          
          if (connectionResult.connected) {
            setStep('connected');
            setQrPollingActive(false);
          } else {
            setStep('connect');
            // If not connected, try to get the QR code
            await fetchQRCode();
          }
        } else {
          // Instance might not exist, set to create state
          setStep('create');
          setInstance(null);
        }
      } else {
        // No instance configured, go to create step
        setStep('create');
        setInstance(null);
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
      setError("Não foi possível verificar o status da conexão com WhatsApp");
      setStep('check');
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    if (!instance?.instanceName) return;
    
    try {
      console.log("Fetching QR code for instance:", instance.instanceName);
      const qrResult = await messagingUtils.getWhatsAppQR(instance.instanceName);
      console.log("QR code result:", qrResult);
      
      if (qrResult.success && qrResult.qrcode) {
        setInstance(prev => prev ? { ...prev, qrCode: qrResult.qrcode, status: 'connecting' } : null);
        setQrPollingActive(true);
        setStep('connect');
      } else if (qrResult.message) {
        console.log("QR code not available:", qrResult.message);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };

  const onSubmitInstance = async (values: InstanceFormValues) => {
    if (!organizationId) {
      setError("ID da organização não disponível. Por favor, recarregue a página.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Save the instance name to the database first
      const saveResult = await messagingUtils.saveWhatsAppInstanceSettings(
        organizationId, 
        values.instanceName
      );
      
      if (!saveResult.success) {
        throw new Error(saveResult.message || "Não foi possível salvar as configurações");
      }
      
      // Now create the instance with Evolution API
      const createResult = await messagingUtils.createWhatsAppInstance(
        values.instanceName, 
        organizationId
      );
      
      if (createResult.success) {
        toast({
          title: "Instância criada",
          description: "Instância do WhatsApp criada com sucesso. Agora você pode conectar.",
        });
        
        setInstance({
          instanceName: values.instanceName,
          status: 'disconnected'
        });
        
        setStep('connect');
      } else {
        setError(createResult.message || "Não foi possível criar a instância");
        toast({
          title: "Erro ao criar instância",
          description: createResult.message || "Não foi possível criar a instância",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating WhatsApp instance:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar instância");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!instance?.instanceName) {
      setError("Nome da instância não disponível");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Just fetch QR code for the already created instance
      await fetchQRCode();
      
      if (!instance.qrCode) {
        toast({
          title: "Preparando QR Code",
          description: "Aguarde enquanto o QR code é gerado...",
        });
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      setError("Não foi possível iniciar a conexão com o WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!instance?.instanceName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Disconnecting WhatsApp instance:", instance.instanceName);
      const result = await messagingUtils.disconnectWhatsApp(instance.instanceName);
      console.log("Disconnect result:", result);
      
      if (result.success) {
        setInstance({
          ...instance,
          status: 'disconnected',
          qrCode: undefined
        });
        
        setQrPollingActive(false);
        setStep('connect');
        
        toast({
          title: "WhatsApp desconectado",
          description: "O WhatsApp foi desconectado com sucesso",
        });
      } else {
        setError(result.message || "Não foi possível desconectar o WhatsApp");
        toast({
          title: "Erro ao desconectar",
          description: result.message || "Não foi possível desconectar o WhatsApp",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      setError("Não foi possível desconectar o WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await checkInstanceStatus();
    setRefreshing(false);
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
            onClick={handleRefresh} 
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitInstance)} className="space-y-4">
              <FormField
                control={form.control}
                name="instanceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Instância</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ex: minha_empresa" />
                    </FormControl>
                    <FormDescription>
                      Use apenas letras, números e underscores. Este será o identificador único da sua instância.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Instância"
                )}
              </Button>
            </form>
          </Form>
        )}
        
        {step === 'connect' && (
          <div className="space-y-4">
            {instance?.status === 'connecting' && instance.qrCode ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                    Escaneie o código QR com seu WhatsApp para conectar
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <img 
                      src={`data:image/png;base64,${instance.qrCode}`} 
                      alt="WhatsApp QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                </div>
                
                <p className="text-sm text-center text-muted-foreground">
                  Abra o WhatsApp no seu telefone e escaneie o código QR acima
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button onClick={handleConnect} disabled={loading} className="w-full max-w-xs">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparando...
                    </>
                  ) : (
                    "Conectar WhatsApp"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {step === 'connected' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">
                    Conectado
                  </p>
                  {instance?.number && (
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Número: {instance.number}
                    </p>
                  )}
                  {instance?.instanceName && (
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Instância: {instance.instanceName}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="destructive" 
                onClick={handleDisconnect} 
                disabled={loading}
                className="flex items-center gap-1"
              >
                <PhoneOff className="h-4 w-4 mr-1" />
                Desconectar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
