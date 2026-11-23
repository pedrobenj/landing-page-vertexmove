import { describe, expect, it } from "vitest"

import { getPasswordRuleMessage } from "./password-rule-message"

describe("getPasswordRuleMessage", () => {
  it("traduz `detalhes[0].regra` da troca de senha", () => {
    expect(getPasswordRuleMessage("tamanho_minimo")).toBe("A nova senha precisa ter pelo menos 12 caracteres.")
    expect(getPasswordRuleMessage("tamanho_maximo")).toBe("A nova senha pode ter no máximo 128 caracteres.")
    expect(getPasswordRuleMessage("senha_obvia")).toBe("Essa senha é fácil de adivinhar. Escolha outra.")
    expect(getPasswordRuleMessage("igual_a_atual")).toBe("A nova senha precisa ser diferente da atual.")
    expect(getPasswordRuleMessage("outra")).toBeNull()
    expect(getPasswordRuleMessage(undefined)).toBeNull()
  })
})
