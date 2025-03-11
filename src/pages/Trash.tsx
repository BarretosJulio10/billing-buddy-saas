
import { TrashTable } from "@/components/trash/TrashTable";

const Trash = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Lixeira</h1>
      </div>
      <p className="text-muted-foreground">
        Itens excluídos são mantidos por 2 meses antes de serem permanentemente removidos.
      </p>
      <TrashTable />
    </div>
  );
};

export default Trash;
