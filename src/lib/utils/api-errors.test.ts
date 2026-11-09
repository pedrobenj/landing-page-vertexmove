import { describe, expect, it } from "vitest"

import { getApiErrorMessage } from "./api-errors"

describe("getApiErrorMessage", () => {
  it("mapeia os códigos do contrato", () => {
    expect(getApiErrorMessage("NAO_AUTENTICADO")).toBe("E-mail ou senha inválidos.")
    expect(getApiErrorMessage("INSCRICAO_DUPLICADA")).toBe("Já existe uma inscrição para este atleta nesta distância.")
    expect(getApiErrorMessage("IDENTIDADES_CONFLITANTES")).toBe(
      "Os dados informados pertencem a cadastros diferentes. Confira o CPF e o WhatsApp.",
    )
    expect(getApiErrorMessage("MFA_NECESSARIO")).toBe(
      "Esta conta exige verificação em duas etapas, ainda indisponível.",
    )
  })

  it("mapeia os códigos internos do BFF", () => {
    expect(getApiErrorMessage("TIMEOUT")).toBe("A conexão demorou demais. Tente novamente.")
    expect(getApiErrorMessage("INDISPONIVEL")).toBe("Serviço indisponível no momento. Tente em alguns minutos.")
    expect(getApiErrorMessage("LOJA_INDISPONIVEL")).toBe("A loja estará disponível em breve.")
  })

  it("usa o fallback para código desconhecido", () => {
    expect(getApiErrorMessage("XYZ", "Falhou")).toBe("Falhou")
  })

  it("usa a mensagem padrão sem código nem fallback", () => {
    expect(getApiErrorMessage(undefined)).toBe("Algo deu errado. Tente novamente.")
    expect(getApiErrorMessage("DESCONHECIDO")).toBe("Algo deu errado. Tente novamente.")
  })
})
