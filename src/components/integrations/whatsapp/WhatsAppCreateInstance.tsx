
import { CardContent } from "@/components/ui/card";
import { WhatsAppInstanceForm } from "../WhatsAppInstanceForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WhatsAppCreateInstanceProps {
  defaultInstanceName: string;
  loading: boolean;
  error: string | null;
  onSubmit: (values: { instanceName: string }) => Promise<void>;
}

export function WhatsAppCreateInstance({ 
  defaultInstanceName, 
  loading, 
  error, 
  onSubmit 
}: WhatsAppCreateInstanceProps) {
  return (
    <CardContent className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <WhatsAppInstanceForm 
        defaultInstanceName={defaultInstanceName}
        loading={loading}
        onSubmit={onSubmit}
      />
    </CardContent>
  );
}
