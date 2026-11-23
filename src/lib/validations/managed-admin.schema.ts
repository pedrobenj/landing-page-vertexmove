import { z } from "zod"

/** Padrão de `ADMIN_PASSWORD_MIN_LENGTH` no backend (quem decide é ele: a regra volta em `detalhes`). */
export const ADMIN_PASSWORD_MIN_LENGTH = 12
export const ADMIN_PASSWORD_MAX_LENGTH = 128

/** Novo admin: corpo de `POST /admin/admins` (estrito, sem senha). */
export const managedAdminFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(160, "Nome com no máximo 160 caracteres"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("E-mail inválido").max(254, "E-mail com no máximo 254 caracteres")),
})

export type ManagedAdminFormInput = z.input<typeof managedAdminFormSchema>

/**
 * Troca da própria senha (`POST /admin/me/senha`). Senhas SEM trim (espaços fazem parte do segredo);
 * a confirmação fica só no form.
 */
export const changeOwnPasswordFormSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual").max(512, "Senha atual inválida"),
    novaSenha: z
      .string()
      .refine((value) => Array.from(value).length >= ADMIN_PASSWORD_MIN_LENGTH, `A nova senha precisa ter pelo menos ${ADMIN_PASSWORD_MIN_LENGTH} caracteres`)
      .refine((value) => Array.from(value).length <= ADMIN_PASSWORD_MAX_LENGTH, `A nova senha pode ter no máximo ${ADMIN_PASSWORD_MAX_LENGTH} caracteres`),
    confirmacao: z.string(),
  })
  .refine((values) => values.confirmacao === values.novaSenha, { message: "As senhas não conferem", path: ["confirmacao"] })
  .refine((values) => values.novaSenha !== values.senhaAtual, { message: "A nova senha precisa ser diferente da atual", path: ["novaSenha"] })
  .transform(({ senhaAtual, novaSenha }) => ({ senhaAtual, novaSenha }))

export type ChangeOwnPasswordFormInput = z.input<typeof changeOwnPasswordFormSchema>
export type ChangeOwnPasswordFormData = z.output<typeof changeOwnPasswordFormSchema>
