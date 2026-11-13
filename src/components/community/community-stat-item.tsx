import { AnimatedCounter, StaggerItem } from "@/components/motion"
import { cn } from "@/lib/utils"
import type { CommunityStat } from "@/types/community-stat.interface"

interface CommunityStatItemProps {
  stat: CommunityStat
  /** `accent`: sobre a faixa verde; `dark`: sobre o navy. */
  tone?: "accent" | "dark"
}

export function CommunityStatItem({ stat, tone = "accent" }: CommunityStatItemProps) {
  const isDark = tone === "dark"
  return (
    <StaggerItem className="flex flex-col items-center gap-1 text-center">
      <AnimatedCounter
        value={stat.valor}
        className={cn("font-heading text-4xl font-black sm:text-5xl", isDark ? "text-brand-green" : "text-brand-navy-deep")}
      />
      <span className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-white/80" : "text-brand-navy-deep/85")}>
        {stat.rotulo}
      </span>
    </StaggerItem>
  )
}
