
import { useOrganization } from "@/hooks/useOrganization";
import { useOverviewStats } from "@/hooks/useOverviewStats";
import { StatsCard } from "./StatsCard";
import { getStatItems } from "./StatItemsConfig";

export function OverviewStats() {
  const { organizationId } = useOrganization();
  const { stats, loading } = useOverviewStats(organizationId);
  const statsItems = getStatItems(stats);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {loading ? (
        // Skeleton loading states
        Array(6).fill(null).map((_, index) => (
          <StatsCard
            key={index}
            title=""
            value=""
            icon={() => null}
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
