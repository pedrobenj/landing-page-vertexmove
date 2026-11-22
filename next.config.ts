import type { NextConfig } from "next";

import { parseImageHosts } from "./src/lib/utils/image-hosts";
import { getSecurityHeaders } from "./src/lib/utils/security-headers";

const isDev = process.env.NODE_ENV === "development"

/**
 * Páginas onde o atleta digita ou vê dados pessoais: nenhum Referer sai daqui para links externos
 * (regulamento em PDF, WhatsApp, corridas parceiras) — §12 do CLAUDE.md.
 */
const NO_REFERRER_PATHS = ["/corridas/:slug/inscricao", "/inscricao/:path*", "/consulta"]

const SECURITY_HEADERS = getSecurityHeaders(process.env.NODE_ENV)

/**
 * Hosts das imagens remotas (`imagemCapaUrl`, `fotos[].url`, logos): `IMAGE_REMOTE_HOSTS` (vírgulas, validado
 * em `src/lib/env.ts`). No `next dev` entram também os hosts fictícios usados pelo mock e pelos e2e.
 * Lido no build: mudar a variável exige novo build.
 */
const DEV_IMAGE_HOSTS = ["example.com", "**.example.com"]
const imageHosts = [...new Set([...parseImageHosts(process.env.IMAGE_REMOTE_HOSTS), ...(isDev ? DEV_IMAGE_HOSTS : [])])]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Túnel HTTPS do teste integrado (retorno do Checkout Pro); só vale no `next dev`.
  allowedDevOrigins: ["*.trycloudflare.com"],
  // O `next dev` imprime os argumentos de cada server action (senha do login, CPF, WhatsApp e nascimento
  // da inscrição e da consulta). Não dá para mascarar campo a campo, então fica desligado (§12 do CLAUDE.md).
  logging: { serverFunctions: false },
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https", hostname })),
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Depois da regra geral: com a mesma chave, o último header que casa vence (docs de `headers`).
      ...NO_REFERRER_PATHS.map((source) => ({
        source,
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      })),
    ]
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
