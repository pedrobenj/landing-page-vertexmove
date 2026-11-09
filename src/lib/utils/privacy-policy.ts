import type { PrivacySection } from "@/types/privacy-section.interface"

import { CONTACT_INFO } from "./contact-info"

/** Data da última revisão, exibida no topo da página (YYYY-MM-DD). */
export const PRIVACY_POLICY_UPDATED_AT = "2026-11-08"

/**
 * Política de privacidade (LGPD). Lista apenas os dados que o site realmente coleta hoje
 * (inscrição: nome, nascimento, CPF/WhatsApp, e-mail; loja: dados do comprador).
 * TODO(cliente): revisar com o jurídico — razão social/CNPJ do controlador, prazos de retenção
 * e a lista de operadores (hospedagem, gateway de pagamento, cronometragem).
 */
export const PRIVACY_POLICY_SECTIONS: readonly PrivacySection[] = [
  {
    id: "quem-somos",
    title: "Quem cuida dos seus dados",
    paragraphs: [
      `O Vertex Grupo de Corrida (${CONTACT_INFO.city}) é o responsável pelos dados pessoais tratados neste site. Para qualquer assunto sobre privacidade, fale com a gente pelo e-mail ${CONTACT_INFO.email}.`,
    ],
  },
  {
    id: "dados-coletados",
    title: "Quais dados coletamos",
    paragraphs: ["Pedimos apenas o necessário para cada serviço:"],
    items: [
      "Na inscrição em uma corrida: nome completo, data de nascimento, CPF e/ou WhatsApp, e-mail (opcional), a distância, o kit e o tamanho de camisa escolhidos, e a data e a hora em que você aceitou o regulamento e o termo de responsabilidade.",
      "Na loja: nome, CPF, WhatsApp e e-mail de quem compra, além dos itens do pedido.",
      "Na consulta de inscrição: o CPF ou o WhatsApp que você digitar, usado só para localizar as suas inscrições.",
      "Na navegação: dados técnicos como endereço IP e tipo de navegador, para segurança e para limitar tentativas abusivas. O carrinho da loja fica salvo no seu próprio navegador, apenas com os produtos e as quantidades.",
    ],
  },
  {
    id: "finalidades",
    title: "Para que usamos",
    paragraphs: [],
    items: [
      "Realizar e identificar a sua inscrição, inclusive na retirada do kit.",
      "Verificar regras da prova que dependem da idade, como a idade mínima por distância e eventuais descontos por idade.",
      "Falar com você sobre a prova ou o pedido (confirmações, avisos de horário e local, mudanças importantes).",
      "Permitir a consulta das suas inscrições sem login, mostrando apenas dados mascarados.",
      "Prevenir fraudes e manter o site seguro.",
      "Cumprir obrigações legais e regulatórias.",
    ],
  },
  {
    id: "compartilhamento",
    title: "Com quem compartilhamos",
    paragraphs: [
      "Não vendemos nem alugamos seus dados. Eles são compartilhados apenas com prestadores de serviço que nos ajudam a operar o site e as provas (como hospedagem, sistema de inscrições e, quando disponível, processamento de pagamentos), sempre no limite do necessário, ou quando a lei exigir.",
    ],
  },
  {
    id: "seguranca",
    title: "Como protegemos",
    paragraphs: [
      "As conexões com o site são criptografadas, o acesso à área administrativa é restrito à organização, e CPF e telefone aparecem sempre mascarados nas telas públicas. Nunca colocamos esses dados em links ou endereços de página.",
    ],
  },
  {
    id: "retencao",
    title: "Por quanto tempo guardamos",
    paragraphs: [
      "Mantemos os dados pelo tempo necessário para realizar a prova ou entregar o pedido e para cumprir obrigações legais. Depois disso, eles são excluídos ou anonimizados.",
    ],
  },
  {
    id: "direitos",
    title: "Seus direitos",
    paragraphs: [
      `Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode, a qualquer momento, pedir pelo e-mail ${CONTACT_INFO.email}:`,
    ],
    items: [
      "Confirmação de que tratamos seus dados e acesso a eles.",
      "Correção de dados incompletos, inexatos ou desatualizados.",
      "Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei.",
      "Portabilidade dos dados e informação sobre com quem os compartilhamos.",
      "Revogação do consentimento, quando o tratamento depender dele.",
    ],
  },
  {
    id: "alteracoes",
    title: "Mudanças nesta política",
    paragraphs: [
      "Podemos atualizar esta política para refletir mudanças no site ou na lei. A data da última revisão fica sempre no topo desta página.",
    ],
  },
]
