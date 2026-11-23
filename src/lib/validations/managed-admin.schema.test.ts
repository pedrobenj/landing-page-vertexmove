import { describe, expect, it } from "vitest"

import { changeOwnPasswordFormSchema, managedAdminFormSchema } from "./managed-admin.schema"

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) => result.error?.issues[0]?.message

describe("managedAdminFormSchema", () => {
  it("corpo de POST /admin/admins (e-mail em minúsculas, sem senha)", () => {
    expect(managedAdminFormSchema.parse({ nome: " Maria Souza ", email: " Maria@Vertex.com.br " })).toEqual({
      nome: "Maria Souza",
      email: "maria@vertex.com.br",
    })
    expect(firstError(managedAdminFormSchema.safeParse({ nome: "", email: "maria@vertex.com.br" }))).toBe("Informe o nome")
    expect(firstError(managedAdminFormSchema.safeParse({ nome: "Maria", email: "maria" }))).toBe("E-mail inválido")
  })
})

describe("changeOwnPasswordFormSchema", () => {
  const valid = { senhaAtual: "Vertex@Dev12345", novaSenha: "Nova senha forte 2026", confirmacao: "Nova senha forte 2026" }

  it("manda só senhaAtual e novaSenha, sem trim", () => {
    expect(changeOwnPasswordFormSchema.parse({ ...valid, novaSenha: " espaços contam ", confirmacao: " espaços contam " })).toEqual({
      senhaAtual: "Vertex@Dev12345",
      novaSenha: " espaços contam ",
    })
  })

  it("regras do backend com mensagens em português", () => {
    const check = (input: Partial<typeof valid>) => firstError(changeOwnPasswordFormSchema.safeParse({ ...valid, ...input }))
    expect(check({ senhaAtual: "" })).toBe("Informe a senha atual")
    expect(check({ novaSenha: "curta", confirmacao: "curta" })).toBe("A nova senha precisa ter pelo menos 12 caracteres")
    expect(check({ novaSenha: "x".repeat(129), confirmacao: "x".repeat(129) })).toBe("A nova senha pode ter no máximo 128 caracteres")
    expect(check({ confirmacao: "outra coisa qualquer" })).toBe("As senhas não conferem")
    expect(check({ novaSenha: valid.senhaAtual, confirmacao: valid.senhaAtual })).toBe("A nova senha precisa ser diferente da atual")
  })
})
