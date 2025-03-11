
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Invoices = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Faturas</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Fatura
        </Button>
      </div>
      {/* Table will be added here after Supabase integration */}
    </div>
  );
};

export default Invoices;
