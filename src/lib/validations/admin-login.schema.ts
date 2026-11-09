import { z } from "zod"

const MAX_EMAIL_LENGTH = 254
const MAX_PASSWORD_LENGTH = 128

/** Login do admin. Mesmas chaves de `POST /admin/auth/login`. A política de senha é do backend. */
export const adminLoginSchema = z.object({
  email: z.string().trim().max(MAX_EMAIL_LENGTH, "E-mail muito longo").pipe(z.email("E-mail inválido")),
  senha: z.string().min(1, "Informe a senha").max(MAX_PASSWORD_LENGTH, "Senha muito longa"),
})

export type AdminLoginInput = z.input<typeof adminLoginSchema>
