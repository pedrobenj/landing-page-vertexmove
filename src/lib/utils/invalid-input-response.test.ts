import { describe, expect, it } from "vitest"

import { invalidInputResponse } from "./invalid-input-response"

describe("invalidInputResponse", () => {
  it("sem issue → mensagem genérica, sem campo", () => {
    expect(invalidInputResponse("Erro")).toEqual({
      status: 422,
      code: "DADO_INVALIDO",
      error: "Confira os dados informados e tente novamente.",
      title: "Erro",
    })
  })

  it("com issue → mensagem e caminho do campo", () => {
    expect(invalidInputResponse("Erro", { message: "URL inválida", path: ["fotos", 0, "url"] })).toMatchObject({
      error: "URL inválida",
      field: "fotos.0.url",
    })
  })
})
