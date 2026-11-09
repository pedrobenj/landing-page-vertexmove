import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { Chevron, VertexLogoPlate } from "@/components/brand"

import { AdminLoginForm, SessionExpiredNotice } from "./components"

export const metadata: Metadata = { title: "Entrar" }

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-brand-navy-deep px-4 py-12">
      <Chevron className="pointer-events-none absolute -right-16 -bottom-10 w-80 opacity-10 sm:w-[28rem]" />

      <div className="relative flex w-full max-w-md flex-col items-center gap-8">
        <Link
          href="/"
          aria-label="Vertex Grupo de Corrida — início"
          className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          <VertexLogoPlate className="h-14 text-lg" priority />
        </Link>

        <section
          aria-labelledby="admin-login-title"
          className="flex w-full flex-col gap-6 rounded-2xl bg-card p-6 shadow-xl sm:p-8"
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold tracking-[0.2em] text-brand-green-text uppercase">Área do organizador</p>
            <h1
              id="admin-login-title"
              className="font-heading text-4xl leading-none font-black tracking-tight text-brand-navy-deep sm:text-5xl"
            >
              Entrar
            </h1>
            <p className="text-sm text-muted-foreground">Acesso restrito à organização do Vertex.</p>
          </div>

          <Suspense fallback={null}>
            <SessionExpiredNotice searchParams={searchParams} />
          </Suspense>

          <AdminLoginForm />
        </section>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-brand-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar ao site
        </Link>
      </div>
    </main>
  )
}
