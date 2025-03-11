
import { useImpersonation } from "@/hooks/useImpersonation";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export function ImpersonationBanner() {
  const { isImpersonating, endImpersonation, loading } = useImpersonation();

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-amber-100 border-b border-amber-200 p-2 text-amber-800">
      <div className="container flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Você está acessando como organização. Esta é uma sessão temporária.</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={endImpersonation} 
          disabled={loading}
          className="bg-white hover:bg-amber-50 border-amber-200 text-amber-800"
        >
          Voltar para Admin
        </Button>
      </div>
    </div>
  );
}
