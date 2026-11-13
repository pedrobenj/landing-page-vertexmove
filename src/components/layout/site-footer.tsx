import { AtSign, Mail, MessageCircle } from "lucide-react"
import Link from "next/link"

import { VertexLogoPlate } from "@/components/brand"
import {
  ADMIN_NAV_ITEM,
  CONTACT_INFO,
  formatInstagramHandle,
  formatPhoneDisplay,
  SITE_NAV_ITEMS,
  SITE_TAGLINE,
  whatsappLink,
} from "@/lib/utils"

import { CurrentYear } from "./current-year"
import { FooterContactItem } from "./footer-contact-item"
import { FooterNavLink } from "./footer-nav-link"

export function SiteFooter() {
  const { whatsappNumber, instagramUrl, email } = CONTACT_INFO

  return (
    <footer className="mt-auto bg-brand-navy-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col items-start gap-4">
          <VertexLogoPlate className="h-24 text-lg" />
          <p className="text-white/80">Vertex Grupo de Corrida — {SITE_TAGLINE}</p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-green">Fale com a gente</h2>
          <ul className="flex flex-col gap-3">
            <FooterContactItem
              icon={MessageCircle}
              label="WhatsApp"
              value={whatsappNumber ? formatPhoneDisplay(whatsappNumber) : ""}
              href={whatsappNumber ? whatsappLink(whatsappNumber) : undefined}
              external
            />
            <FooterContactItem icon={Mail} label="E-mail" value={email} href={`mailto:${email}`} />
            <FooterContactItem
              icon={AtSign}
              label="Instagram"
              value={formatInstagramHandle(instagramUrl)}
              href={instagramUrl || undefined}
              external
            />
          </ul>
        </div>

        <nav aria-label="Navegação do rodapé" className="flex flex-col gap-4">
          <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-green">Explore</h2>
          <ul className="flex flex-col gap-2.5">
            {SITE_NAV_ITEMS.map((item) => (
              <FooterNavLink key={item.href} item={item} />
            ))}
            <FooterNavLink item={ADMIN_NAV_ITEM} />
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs leading-relaxed text-white/70">
          © <CurrentYear /> Vertex Grupo de Corrida. Todos os direitos reservados. · Desenvolvido por Pedro Benjamin ·{" "}
          <Link href="/privacidade" className="underline-offset-4 hover:text-brand-green hover:underline">
            Privacidade
          </Link>
        </p>
      </div>

      {/*
        Páginas com barra fixa no rodapé do mobile (ex.: CTA de inscrição do evento, `data-sticky-cta`)
        ganham este espaço no fim, para a barra não cobrir o crédito.
      */}
      <div
        aria-hidden="true"
        data-testid="sticky-cta-spacer"
        className="hidden h-[calc(5rem+env(safe-area-inset-bottom))] max-md:in-[body:has([data-sticky-cta])]:block"
      />
    </footer>
  )
}
