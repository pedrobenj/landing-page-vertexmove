import { AnimatedCounter, StaggerItem } from "@/components/motion"
import type { CommunityStat } from "@/types/community-stat.interface"

interface CommunityStatItemProps {
  stat: CommunityStat
}

export function CommunityStatItem({ stat }: CommunityStatItemProps) {
  return (
    <StaggerItem className="flex flex-col items-center gap-1 text-center">
      <AnimatedCounter value={stat.valor} className="font-heading text-4xl font-black text-brand-navy-deep sm:text-5xl" />
      <span className="text-xs font-bold uppercase tracking-widest text-brand-navy-deep/85">{stat.rotulo}</span>
    </StaggerItem>
  )
}
