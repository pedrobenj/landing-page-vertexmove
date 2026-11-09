import Link from "next/link"
import { Suspense } from "react"

import { VertexLogoPlate } from "@/components/brand"

import { AdminNav, AdminUserBadge, AdminUserBadgeSkeleton, LogoutButton } from "./components"

/** Painel do admin. O acesso é protegido pelo `proxy.ts` e, em cada chamada à API, pelo `adminFetch`. */
export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-brand-navy-deep text-white shadow-sm">
        {/* Mobile: logo e usuário na 1ª linha, menu rolável na 2ª. Desktop: tudo numa linha. */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link
            href="/admin"
            aria-label="Painel do admin"
            className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            <VertexLogoPlate priority />
            <span className="hidden text-xs font-bold tracking-[0.2em] text-brand-green uppercase lg:inline">Admin</span>
          </Link>

          <div className="order-last w-full md:order-none md:w-auto md:flex-1">
            <AdminNav />
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Suspense fallback={<AdminUserBadgeSkeleton />}>
              <AdminUserBadge />
            </Suspense>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </>
  )
}
