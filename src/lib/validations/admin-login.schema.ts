import { z } from "zod"

export const adminLoginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
})

export type AdminLoginInput = z.input<typeof adminLoginSchema>
