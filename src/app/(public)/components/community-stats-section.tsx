import { CommunityStatsBand } from "@/components/community"
import { getCommunityStats } from "@/server/content/community-stats"

export function CommunityStatsSection() {
  return <CommunityStatsBand stats={getCommunityStats()} />
}
