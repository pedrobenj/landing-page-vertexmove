import { Camera, MessageCircle, ShoppingBag } from "lucide-react"
import Link from "next/link"

import { VertexLogo } from "@/components/brand"
import { publicEnv } from "@/lib/public-env"
import { whatsappLink } from "@/lib/utils"

import { CurrentYear } from "./current-year"

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <VertexLogo variant="white" className="w-36" />

        <ul className="flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
          {publicEnv.whatsappNumber && (
            <li>
              <a href={whatsappLink(publicEnv.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-brand-green">
                <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
              </a>
            </li>
          )}
          {publicEnv.instagramUrl && (
            <li>
              <a href={publicEnv.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-brand-green">
                <Camera className="size-4" aria-hidden="true" /> Instagram
              </a>
            </li>
          )}
          <li>
            <Link href="/loja" className="inline-flex items-center gap-2 hover:text-brand-green">
              <ShoppingBag className="size-4" aria-hidden="true" /> Loja
            </Link>
          </li>
          <li>
            <Link href="/privacidade" className="hover:text-brand-green">Privacidade</Link>
          </li>
        </ul>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-white/70">
          © <CurrentYear /> Vertex Grupo de Corrida · Fortaleza/CE · Desenvolvido por Pedro Benjamin
        </p>
      </div>
    </footer>
  )
}
