
export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full py-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando detalhes da empresa...</p>
      </div>
    </div>
  );
}
