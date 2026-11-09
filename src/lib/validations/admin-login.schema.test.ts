import { describe, expect, it } from "vitest"

import { adminLoginSchema } from "./admin-login.schema"

describe("adminLoginSchema", () => {
  it("aceita e-mail e senha, removendo espaços do e-mail", () => {
    expect(adminLoginSchema.parse({ email: " admin@example.com ", senha: "Vertex@Dev12345" })).toEqual({
      email: "admin@example.com",
      senha: "Vertex@Dev12345",
    })
  })

  it("recusa e-mail inválido e senha vazia com mensagens em português", () => {
    const result = adminLoginSchema.safeParse({ email: "email-invalido", senha: "" })

    expect(result.success).toBe(false)
    const messages = result.error!.issues.map((issue) => issue.message)
    expect(messages).toContain("E-mail inválido")
    expect(messages).toContain("Informe a senha")
  })
})
