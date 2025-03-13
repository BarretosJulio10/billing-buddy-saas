
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockIcon, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { generatePaymentLink } from "@/utils/paymentUtils";
import { useState } from "react";

export default function Blocked() {
  const { organization, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePayNow = async () => {
    if (!organization) return;
    
    try {
      setLoading(true);
      const paymentLink = await generatePaymentLink(organization);
      window.open(paymentLink, '_blank');
    } catch (error) {
      console.error("Error generating payment link:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <LockIcon className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Conta Bloqueada</CardTitle>
          <CardDescription>
            Sua conta está temporariamente bloqueada devido a um problema com sua assinatura.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Assinatura vencida</p>
                <p className="mt-1">
                  Sua assinatura está vencida. Para reativar sua conta, por favor, efetue o pagamento da mensalidade.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border p-4">
            <div className="font-medium">Detalhes da assinatura</div>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-red-600">Vencida</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span>R$ {organization?.subscriptionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de vencimento:</span>
                <span>{new Date(organization?.subscriptionDueDate || '').toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={handlePayNow}
            disabled={loading}
          >
            {loading ? "Processando..." : "Realizar Pagamento"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => signOut()}
          >
            Sair
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
