
import { useOrganization } from "@/hooks/useOrganization";
import { useOverviewStats } from "@/hooks/useOverviewStats";
import { StatsCard } from "./StatsCard";
import { getStatItems } from "./StatItemsConfig";
import { CircleOff } from "lucide-react"; // Import a placeholder icon for loading state

export function OverviewStats() {
  const { organizationId } = useOrganization();
  const { stats, loading } = useOverviewStats(organizationId);
  const statsItems = getStatItems(stats);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {loading ? (
        // Skeleton loading states with valid icon component
        Array(6).fill(null).map((_, index) => (
          <StatsCard
            key={index}
            title=""
            value=""
            icon={CircleOff} // Use a valid Lucide icon instead of a function
            change=""
            positive={true}
            color=""
            loading={true}
          />
        ))
      ) : (
        statsItems.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))
      )}
    </div>
  );
}
