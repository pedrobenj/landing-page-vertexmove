import Link from "next/link"

import { VertexLogo } from "@/components/brand"

import { LogoutButton } from "./components"

// Acesso protegido pelo proxy.ts. Server actions de admin DEVEM checar a sessão com auth().
export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="bg-brand-navy text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
          <Link href="/admin" aria-label="Dashboard">
            <VertexLogo variant="white" className="w-28" />
          </Link>
          <nav aria-label="Admin" className="flex items-center gap-4 text-sm">
            <Link href="/admin/eventos" className="hover:text-brand-green">Eventos</Link>
            <Link href="/admin/medalhas" className="hover:text-brand-green">Medalhas</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
    </>
  )
}
