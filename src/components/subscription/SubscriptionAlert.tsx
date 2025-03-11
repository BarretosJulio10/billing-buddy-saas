
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SubscriptionAlert() {
  const { organization, subscriptionExpiringSoon } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [daysUntilDue, setDaysUntilDue] = useState(0);

  useEffect(() => {
    if (organization && subscriptionExpiringSoon) {
      setShowAlert(true);
      
      const dueDate = new Date(organization.subscriptionDueDate);
      const today = new Date();
      setDaysUntilDue(differenceInDays(dueDate, today));
      
      // Buscar ou gerar link de pagamento
      generatePaymentLink();
    }
  }, [organization, subscriptionExpiringSoon]);

  const generatePaymentLink = async () => {
    if (!organization) return;
    
    try {
      // Isto seria substituído por uma chamada real ao gateway de pagamento
      // Por enquanto é apenas um placeholder
      setPaymentUrl("#/pagamento");
      
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
    }
  };

  const handlePay = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
    setShowAlert(false);
  };

  return (
    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sua assinatura vence em breve</AlertDialogTitle>
          <AlertDialogDescription>
            A mensalidade do sistema vence em {daysUntilDue} {daysUntilDue === 1 ? 'dia' : 'dias'}, 
            em {organization?.subscriptionDueDate ? format(new Date(organization.subscriptionDueDate), "dd 'de' MMMM", { locale: ptBR }) : ''}. 
            O valor é de R$ {organization?.subscriptionAmount?.toFixed(2)}. 
            Clique no botão abaixo para pagar agora e continuar usando todos os recursos do sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button onClick={handlePay} className="bg-green-600 hover:bg-green-700">
              Pagar Agora
            </Button>
          </AlertDialogAction>
          <Button variant="outline" onClick={() => setShowAlert(false)}>
            Pagar depois
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
