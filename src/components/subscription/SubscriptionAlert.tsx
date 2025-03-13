
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { generatePaymentLink } from "@/utils/paymentUtils";

export function SubscriptionAlert() {
  const [loading, setLoading] = useState(false);
  const { organization } = useAuth();

  const handlePayNow = async () => {
    if (!organization) return;
    
    try {
      setLoading(true);
      // In a real application, this would redirect to the payment gateway
      const paymentLink = await generatePaymentLink(organization);
      window.open(paymentLink, '_blank');
    } catch (error) {
      console.error("Error generating payment link:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!organization?.subscriptionExpiringSoon) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Sua assinatura vence em breve
          </h3>
          <div className="mt-1 text-sm text-amber-700">
            <p>
              Sua assinatura vencerá em breve. Para evitar interrupções no serviço, 
              por favor, realize o pagamento antes da data de vencimento.
            </p>
          </div>
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-amber-50 border-amber-200 text-amber-800"
              onClick={handlePayNow}
              disabled={loading}
            >
              {loading ? "Processando..." : "Pagar agora"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
