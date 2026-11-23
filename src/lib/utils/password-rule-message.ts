const MESSAGES: Partial<Record<string, string>> = {
  tamanho_minimo: "A nova senha precisa ter pelo menos 12 caracteres.",
  tamanho_maximo: "A nova senha pode ter no máximo 128 caracteres.",
  senha_obvia: "Essa senha é fácil de adivinhar. Escolha outra.",
  igual_a_atual: "A nova senha precisa ser diferente da atual.",
}

/** `detalhes[0].regra` do 422 de `POST /admin/me/senha` → mensagem do campo; regra desconhecida → `null`. */
export function getPasswordRuleMessage(regra: string | undefined): string | null {
  return (regra && MESSAGES[regra]) || null
}
