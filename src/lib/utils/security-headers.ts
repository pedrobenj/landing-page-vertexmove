export interface SecurityHeader {
  key: string
  value: string
}

/**
 * CSP sem nonce (guia `content-security-policy.md`, seção "Without Nonces"): nonce exigiria renderizar
 * todas as páginas sob demanda e é incompatível com o Partial Prerendering (Cache Components). Por isso
 * `'unsafe-inline'` em scripts (bootstrap/hidratação do Next) e estilos (Motion e next/image usam `style`).
 * `'unsafe-eval'` só no `next dev` (React reconstrói stacks com eval). Fontes do next/font são self-hosted.
 */
function buildContentSecurityPolicy(isDev: boolean): string {
  return [
    "default-src 'self'",
    "img-src 'self' https: data: blob:",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ")
}

/**
 * HSTS de 2 anos com preload (fase 9). A Vercel já adiciona o header; fora dela, é o Next que garante.
 * Só em produção: em `http://localhost` o navegador gravaria a regra para o host e quebraria o dev.
 */
const HSTS: SecurityHeader = { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }

/** Headers de segurança de todas as rotas (`next.config.ts`), conforme o `NODE_ENV`. */
export function getSecurityHeaders(nodeEnv: string | undefined): SecurityHeader[] {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(nodeEnv === "development") },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ...(nodeEnv === "production" ? [HSTS] : []),
  ]
}
