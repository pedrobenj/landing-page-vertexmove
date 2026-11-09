import { API_ERROR_CODE } from "@/enums/api-error-code.enum"

const DEFAULT_MESSAGE = "Algo deu errado. Tente novamente."

/** Mensagens amigáveis por `error.codigo` (tabela de §6 do CLAUDE.md + códigos do BFF). */
const MESSAGES: Partial<Record<string, string>> = {
  [API_ERROR_CODE.NOT_AUTHENTICATED]: "E-mail ou senha inválidos.",
  [API_ERROR_CODE.MFA_REQUIRED]: "Esta conta exige verificação em duas etapas, ainda indisponível.",
  [API_ERROR_CODE.ACCESS_DENIED]: "Você não tem permissão para realizar esta ação.",
  [API_ERROR_CODE.NOT_FOUND]: "Não encontramos o que você procurava.",
  [API_ERROR_CODE.DUPLICATE_REGISTRATION]: "Já existe uma inscrição para este atleta nesta distância.",
  [API_ERROR_CODE.CONFLICTING_IDENTITIES]:
    "Os dados informados pertencem a cadastros diferentes. Confira o CPF e o WhatsApp.",
  [API_ERROR_CODE.DOCUMENT_ACCEPTANCE_REQUIRED]: "Aceite o regulamento e o termo de responsabilidade para continuar.",
  [API_ERROR_CODE.INVALID_DATA]: "Confira os dados informados e tente novamente.",
  [API_ERROR_CODE.DUPLICATE_SLUG]: "Já existe um evento com este endereço (slug).",
  [API_ERROR_CODE.INVALID_TRANSITION]: "Esta ação não é permitida no status atual do evento.",
  [API_ERROR_CODE.TIMEOUT]: "A conexão demorou demais. Tente novamente.",
  [API_ERROR_CODE.UNAVAILABLE]: "Serviço indisponível no momento. Tente em alguns minutos.",
  [API_ERROR_CODE.STORE_UNAVAILABLE]: "A loja estará disponível em breve.",
}

export function getApiErrorMessage(codigo: string | undefined, fallback?: string): string {
  return (codigo && MESSAGES[codigo]) || fallback || DEFAULT_MESSAGE
}
