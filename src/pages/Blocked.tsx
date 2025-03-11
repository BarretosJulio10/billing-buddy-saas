
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

export default function BlockedPage() {
  const { user, organization, isBlocked, signOut } = useAuth();

  // Se o usuário não está bloqueado, redirecionar para a página inicial
  if (!isBlocked) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle className="text-red-500">Conta Bloqueada</CardTitle>
          </div>
          <CardDescription>
            O acesso à sua conta foi temporariamente bloqueado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-md text-red-800 text-sm border border-red-200">
            <p>Sua conta foi bloqueada devido a um problema com o pagamento ou por decisão administrativa.</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-medium">Informações da conta:</h3>
            <div className="text-sm text-gray-600">
              <p><strong>Empresa:</strong> {organization?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-medium">Como resolver:</h3>
            <div className="text-sm text-gray-600">
              <p>Entre em contato com nosso suporte para regularizar sua situação e desbloquear sua conta.</p>
              <p className="mt-2">
                <a href="mailto:suporte@pagoupix.com" className="text-blue-600 hover:underline">
                  suporte@pagoupix.com
                </a>
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            variant="outline"
            asChild
          >
            <Link to="/login" onClick={signOut}>
              Fazer logout
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
