import { describe, expect, it } from "vitest"

import { toCreateRegistrationInput } from "./to-create-registration-input"

const athlete = {
  nomeCompleto: "  Maria   da Silva ",
  dataNascimento: "06/12/1990",
  cpf: "529.982.247-25",
  whatsapp: "(85) 99999-0000",
  email: "maria@example.com",
}

describe("toCreateRegistrationInput", () => {
  it("normaliza CPF, WhatsApp, data e nome", () => {
    expect(
      toCreateRegistrationInput(
        "corrida",
        { distance: { distanciaId: 1, kitId: 2, tamanhoCamisaId: 3 }, athlete },
        [101, 102],
      ),
    ).toEqual({
      eventoSlug: "corrida",
      distanciaId: 1,
      kitId: 2,
      tamanhoCamisaId: 3,
      nomeCompleto: "Maria da Silva",
      dataNascimento: "1990-12-06",
      cpf: "52998224725",
      whatsapp: "+5585999990000",
      email: "maria@example.com",
      documentosAceitos: [101, 102],
    })
  })

  it("omite kit, tamanho e campos vazios", () => {
    const input = toCreateRegistrationInput(
      "corrida",
      { distance: { distanciaId: 1, kitId: null, tamanhoCamisaId: null }, athlete: { ...athlete, cpf: "", email: " " } },
      [101],
    )
    expect(input).toEqual({
      eventoSlug: "corrida",
      distanciaId: 1,
      nomeCompleto: "Maria da Silva",
      dataNascimento: "1990-12-06",
      whatsapp: "+5585999990000",
      documentosAceitos: [101],
    })
    expect(Object.keys(input)).not.toContain("cpf")
  })
})
