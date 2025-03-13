
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyState() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <FileX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Empresa não encontrada</h2>
      <p className="text-muted-foreground mb-6">
        A empresa que você está procurando não existe ou foi removida.
      </p>
      <Button onClick={() => navigate('/admin/organizations')}>
        Ver todas as empresas
      </Button>
    </div>
  );
}
