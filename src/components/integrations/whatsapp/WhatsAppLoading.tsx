
import { Loader2 } from "lucide-react";
import { CardContent } from "@/components/ui/card";

export function WhatsAppLoading() {
  return (
    <CardContent>
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </CardContent>
  );
}
