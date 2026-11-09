import type { CommunityStat } from "@/types/community-stat.interface"

interface CommunityStatItemProps {
  stat: CommunityStat
}

export function CommunityStatItem({ stat }: CommunityStatItemProps) {
  return (
    <li className="flex flex-col items-center gap-1 text-center">
      <span className="font-heading text-4xl font-black text-brand-navy-deep sm:text-5xl">{stat.valor}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-brand-navy-deep/85">{stat.rotulo}</span>
    </li>
  )
}
