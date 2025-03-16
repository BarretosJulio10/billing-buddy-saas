
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
  positive: boolean;
  color: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  positive,
  color,
  loading = false
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`rounded-full p-1.5 bg-${color}/10`}>
            <Icon className={`h-4 w-4 text-${color}`} />
          </div>
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className={`text-xs flex items-center ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? (
            <ArrowUp className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDown className="h-3 w-3 mr-1" />
          )}
          <span>{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}
