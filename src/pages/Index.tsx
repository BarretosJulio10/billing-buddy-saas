
import { Card } from "@/components/ui/card";
import { Users, FileText, Bell } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h2 className="font-semibold">Clientes</h2>
              <p className="text-sm text-muted-foreground">Gerenciar clientes</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h2 className="font-semibold">Faturas</h2>
              <p className="text-sm text-muted-foreground">Controle de faturas</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <Bell className="w-8 h-8 text-primary" />
            <div>
              <h2 className="font-semibold">Cobranças</h2>
              <p className="text-sm text-muted-foreground">Régua de cobrança</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
