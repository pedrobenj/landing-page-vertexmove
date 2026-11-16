import { describe, expect, it } from "vitest"

import { getApiErrorMessage, getLoginErrorMessage } from "./api-errors"

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

  it("mapeia os literais reais do backend (error-codes.ts), não só os do mock", () => {
    expect(getApiErrorMessage("VAGA_ESGOTADA")).toBe("As vagas desta distância esgotaram.")
    expect(getApiErrorMessage("LOTE_INDISPONIVEL")).toBe("Não há lote de preço aberto para esta distância no momento.")
    expect(getApiErrorMessage("RECURSO_NAO_ENCONTRADO")).toBe("Não encontramos o que você procurava.")
    expect(getApiErrorMessage("LIMITE_EXCEDIDO")).toBe("Muitas tentativas. Aguarde alguns minutos e tente de novo.")
    expect(getApiErrorMessage("CONFLITO_DE_ESTADO")).toMatch(/não é permitida no status atual/)
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

describe("getLoginErrorMessage", () => {
  it.each([429, 423])("status %i (rate limit / conta bloqueada) pede para aguardar", (status) => {
    expect(getLoginErrorMessage(status, "QUALQUER")).toBe("Muitas tentativas. Aguarde alguns minutos e tente de novo.")
  })

  it("demais status usam a mensagem do código", () => {
    expect(getLoginErrorMessage(401, "NAO_AUTENTICADO")).toBe("E-mail ou senha inválidos.")
  })
})
