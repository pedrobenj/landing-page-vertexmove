import "server-only"

import { z } from "zod"

import { areValidImageHosts, parseImageHosts } from "./utils/image-hosts"

/** Variáveis de ambiente do SERVIDOR, validadas na inicialização. */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_URL: z.url().default("http://localhost:3000"),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  /** Responde as chamadas à API com dados fictícios (sem backend). Somente fora de produção. */
  USE_MOCK_API: z.stringbool().default(false),
  /**
   * Hosts das imagens remotas (capas, fotos de kit, logos), separados por vírgula. Lido pelo
   * `next.config.ts` (images.remotePatterns, só https) no build; validado aqui para falhar cedo.
   */
  IMAGE_REMOTE_HOSTS: z
    .string()
    .optional()
    .refine((value) => areValidImageHosts(parseImageHosts(value)), {
      message: "Use hosts separados por vírgula, sem protocolo nem caminho (ex.: cdn.vertex.com.br,*.cloudfront.net).",
    }),
})

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:", z.flattenError(parsed.error).fieldErrors)
  throw new Error("Variáveis de ambiente inválidas. Veja .env.example.")
}

if (parsed.data.NODE_ENV === "production" && parsed.data.USE_MOCK_API) {
  throw new Error("USE_MOCK_API não pode estar ativo em produção.")
}

export const env = parsed.data
