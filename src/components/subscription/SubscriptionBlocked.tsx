
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SubscriptionBlocked() {
  const { organization, signOut } = useAuth();
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePayment = async () => {
    if (!organization) return;
    
    setIsGenerating(true);
    try {
      // Isto seria substituído por uma chamada real ao gateway de pagamento
      // Por enquanto é apenas um placeholder
      setTimeout(() => {
        setPaymentUrl("#/pagamento");
        setIsGenerating(false);
      }, 1500);
      
      // Aqui você faria uma chamada para gerar o link de pagamento
      // Exemplo:
      // const { data } = await supabase.functions.invoke('generate-payment-link', {
      //   body: { organizationId: organization.id, amount: organization.subscriptionAmount }
      // });
      // if (data?.paymentUrl) {
      //   setPaymentUrl(data.paymentUrl);
      // }
    } catch (error) {
      console.error('Erro ao gerar link de pagamento:', error);
      setIsGenerating(false);
    }
  };

  const handlePay = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-red-600">Acesso Bloqueado</CardTitle>
          <CardDescription className="text-center">
            Sua assinatura está vencida e o acesso ao sistema foi bloqueado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">
            <p>Para continuar usando o sistema, por favor, efetue o pagamento da mensalidade.</p>
            <p className="mt-2">Valor: R$ {organization?.subscriptionAmount?.toFixed(2)}</p>
          </div>
          
          {paymentUrl ? (
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handlePay}
            >
              Pagar Agora
            </Button>
          ) : (
            <Button 
              className="w-full"
              onClick={handleGeneratePayment}
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando link..." : "Gerar Link de Pagamento"}
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={signOut}>
            Sair
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
