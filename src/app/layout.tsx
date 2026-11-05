import type { Metadata, Viewport } from "next"
import { Inter, Montserrat } from "next/font/google"

import { CartHydrator } from "@/components/providers/cart-hydrator"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"
import { publicEnv } from "@/lib/public-env"

import "./globals.css"

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["700", "800"],
})

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: {
    default: "Vertex Grupo de Corrida — Inscrições",
    template: "%s | Vertex Grupo de Corrida",
  },
  description: "Inscrições para as corridas de rua do Vertex Grupo de Corrida em Fortaleza/CE.",
  openGraph: { locale: "pt_BR", type: "website", siteName: "Vertex Grupo de Corrida" },
}

export const viewport: Viewport = {
  themeColor: "#0b3275",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
        <CartHydrator />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
