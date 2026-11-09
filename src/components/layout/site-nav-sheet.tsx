"use client"

import { Menu, X } from "lucide-react"
import { useState } from "react"

import { VertexLogoPlate } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import { ADMIN_NAV_ITEM, CONSULTATION_NAV_ITEM, SITE_NAV_ITEMS } from "@/lib/utils"

import { SiteNavLink } from "./site-nav-link"

/** Botão hambúrguer + navegação em painel lateral, em todos os tamanhos de tela (como na referência). */
export function SiteNavSheet() {
  const [isOpen, setIsOpen] = useState(false)
  useCloseOnRouteChange(() => setIsOpen(false), isOpen)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Abrir menu"
          className="size-11 text-white hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white"
        >
          <Menu className="size-6" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[85%] gap-0 border-l-white/10 bg-brand-navy-deep text-white sm:max-w-sm"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-white/10 p-4">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Navegação do site Vertex Grupo de Corrida</SheetDescription>
          <VertexLogoPlate />
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Fechar menu"
              className="size-11 text-white hover:bg-white/10 hover:text-white"
            >
              <X className="size-6" aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <nav aria-label="Menu principal" className="flex flex-1 flex-col overflow-y-auto p-4">
          <ul className="flex flex-col gap-1">
            {SITE_NAV_ITEMS.map((item) => (
              <SiteNavLink key={item.href} item={item} />
            ))}
          </ul>

          <ul className="mt-6 flex flex-col gap-1 border-t border-white/10 pt-6">
            <SiteNavLink item={CONSULTATION_NAV_ITEM} />
          </ul>

          <ul className="mt-auto pt-6">
            <SiteNavLink item={ADMIN_NAV_ITEM} subtle />
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
