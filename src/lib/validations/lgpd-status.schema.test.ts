import { describe, expect, it } from "vitest"

import { lgpdStatusFormSchema } from "./lgpd-status.schema"

describe("lgpdStatusFormSchema", () => {
  it("em andamento sem resposta: a resposta fica fora do corpo (o backend recusa null)", () => {
    expect(lgpdStatusFormSchema.parse({ status: "em_andamento", resposta: "  " })).toEqual({ status: "em_andamento" })
  })

  it("concluída e recusada exigem a resposta ao titular", () => {
    for (const status of ["concluida", "recusada"]) {
      const result = lgpdStatusFormSchema.safeParse({ status, resposta: "" })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0]).toMatchObject({ path: ["resposta"], message: "Escreva a resposta enviada ao titular" })
    }
    expect(lgpdStatusFormSchema.parse({ status: "concluida", resposta: " Enviado. " })).toEqual({ status: "concluida", resposta: "Enviado." })
  })

  it("limita a resposta e recusa status desconhecido", () => {
    expect(lgpdStatusFormSchema.safeParse({ status: "concluida", resposta: "a".repeat(4001) }).success).toBe(false)
    expect(lgpdStatusFormSchema.safeParse({ status: "xyz", resposta: null }).success).toBe(false)
  })
})
