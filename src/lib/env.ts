import "server-only"

import { z } from "zod"

/**
 * Variáveis de ambiente do SERVIDOR, validadas na inicialização.
 * Integrações ainda não configuradas (pagamento, e-mail, storage) são opcionais
 * até a definição com o cliente — tornar obrigatórias quando entrarem em produção.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET deve ter pelo menos 32 caracteres"),
  AUTH_URL: z.url().optional(),
  PAYMENT_ACCESS_TOKEN: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  /** Dados fictícios no front (sem banco). Somente em desenvolvimento. */
  USE_MOCK_DATA: z.stringbool().default(false),
})

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:", z.flattenError(parsed.error).fieldErrors)
  throw new Error("Variáveis de ambiente inválidas. Veja .env.example.")
}

if (parsed.data.NODE_ENV === "production" && parsed.data.USE_MOCK_DATA) {
  throw new Error("USE_MOCK_DATA não pode estar ativo em produção.")
}

export const env = parsed.data
