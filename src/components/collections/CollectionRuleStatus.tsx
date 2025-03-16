
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CollectionRuleStatusProps {
  isActive: boolean;
  onStatusChange: () => void;
}

export function CollectionRuleStatus({ isActive, onStatusChange }: CollectionRuleStatusProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Switch 
            checked={isActive} 
            onCheckedChange={onStatusChange}
          />
        </TooltipTrigger>
        <TooltipContent>
          {isActive ? "Desativar modelo" : "Ativar modelo"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
