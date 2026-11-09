import { SiteFooter, SiteHeader } from "@/components/layout"
import { MotionProvider, ScrollProgressBar } from "@/components/motion"

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <MotionProvider>
      {/* Sem JavaScript as animações não rodam: mostra direto o estado final. */}
      <noscript>
        <style>{"[data-motion]{opacity:1!important;transform:none!important;filter:none!important}"}</style>
      </noscript>
      <ScrollProgressBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </MotionProvider>
  )
}
