import type { NextConfig } from "next";

import { parseImageHosts } from "./src/lib/utils/image-hosts";

const isDev = process.env.NODE_ENV === "development"

/**
 * Páginas onde o atleta digita ou vê dados pessoais: nenhum Referer sai daqui para links externos
 * (regulamento em PDF, WhatsApp, corridas parceiras) — §12 do CLAUDE.md.
 */
const NO_REFERRER_PATHS = ["/corridas/:slug/inscricao", "/inscricao/:path*", "/consulta"]

/**
 * Mercado Pago (cartão, fase 2): o SDK `sdk.mercadopago.com/js/v2` baixa recursos de `*.mlstatic.com`, fala com
 * `api.mercadopago.com`/`*.mercadolibre.com` e desenha os campos do cartão em iframes. Não há lista oficial
 * fechada de hosts: por isso os curingas dos domínios do Mercado Pago. Liberados SÓ na página de pagamento
 * (`PAYMENT_PATHS`); no resto do site a CSP continua restrita a `'self'`. Revisar ao montar o Card Payment Brick.
 */
const MERCADO_PAGO_HOSTS = {
  script: "https://sdk.mercadopago.com https://*.mercadopago.com https://*.mlstatic.com",
  connect: "https://*.mercadopago.com https://*.mercadolibre.com https://*.mlstatic.com",
  frame: "https://*.mercadopago.com https://*.mercadopago.com.br https://*.mercadolibre.com",
}

/** Página de status/pagamento da inscrição (`/inscricao/VX-2026-00000042`), sem casar `/inscricao/confirmada`. */
const PAYMENT_PATHS = ["/inscricao/:code(VX-\\d{4}-\\d{8})"]

/**
 * CSP sem nonce (guia `content-security-policy.md`, seção "Without Nonces"): nonce exigiria renderizar
 * todas as páginas sob demanda e é incompatível com o Partial Prerendering (Cache Components). Por isso
 * `'unsafe-inline'` em scripts (bootstrap/hidratação do Next) e estilos (Motion e next/image usam `style`).
 * `'unsafe-eval'` só no `next dev` (React reconstrói stacks com eval). Fontes do next/font são self-hosted.
 */
function buildContentSecurityPolicy({ allowMercadoPago }: { allowMercadoPago: boolean }) {
  const extra = (hosts: string) => (allowMercadoPago ? ` ${hosts}` : "")
  return [
    "default-src 'self'",
    "img-src 'self' https: data: blob:",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${extra(MERCADO_PAGO_HOSTS.script)}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    `connect-src 'self'${extra(MERCADO_PAGO_HOSTS.connect)}`,
    `frame-src 'self'${extra(MERCADO_PAGO_HOSTS.frame)}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ")
}

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: buildContentSecurityPolicy({ allowMercadoPago: false }) },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
]

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
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https", hostname })),
  },
  async redirects() {
    // Página antiga de medalhas: agora é o filtro de medalhas da loja (§5 do CLAUDE.md).
    return [{ source: "/medalhas", destination: "/loja?tipo=medalhas", permanent: true }]
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Depois da regra geral: com a mesma chave, o último header que casa vence (docs de `headers`).
      ...NO_REFERRER_PATHS.map((source) => ({
        source,
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      })),
      ...PAYMENT_PATHS.map((source) => ({
        source,
        headers: [{ key: "Content-Security-Policy", value: buildContentSecurityPolicy({ allowMercadoPago: true }) }],
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
