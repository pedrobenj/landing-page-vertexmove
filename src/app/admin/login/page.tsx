import type { Metadata } from "next"

import { VertexLogo } from "@/components/brand"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { AdminLoginForm } from "./components"

export const metadata: Metadata = { title: "Entrar" }

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center gap-4 text-center">
          <VertexLogo className="mx-auto w-36" priority />
          <CardTitle className="font-heading text-xl font-bold text-brand-navy">Área do organizador</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
