import type { PrivacySection } from "@/types/privacy-section.interface"

import { CONTACT_INFO } from "./contact-info"

/** Data da última revisão, exibida no topo da página (YYYY-MM-DD). */
export const PRIVACY_POLICY_UPDATED_AT = "2026-11-09"

/**
 * Política de privacidade (LGPD). Lista apenas os dados que o site realmente coleta hoje
 * (inscrição: nome, nascimento, CPF/WhatsApp, e-mail; loja: dados do comprador).
 * TODO(cliente): revisar com o jurídico — razão social/CNPJ do controlador, prazos de retenção,
 * a lista de operadores (hospedagem, gateway de pagamento, cronometragem), as bases legais por finalidade,
 * a regra para inscrição de menores e o país onde ficam os servidores da hospedagem.
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
      "Na loja: nome, CPF, WhatsApp e e-mail de quem compra, os itens do pedido e a data e a hora em que você aceitou esta política no checkout.",
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
    id: "bases-legais",
    title: "Com base em quê tratamos seus dados",
    paragraphs: ["Cada uso tem uma base legal prevista no art. 7º da LGPD:"],
    items: [
      "Execução de contrato e de procedimentos preliminares (inciso V): para realizar a inscrição, entregar o kit ou o pedido da loja e falar com você sobre eles.",
      "Cumprimento de obrigação legal ou regulatória (inciso II): para guardar registros exigidos por lei, como os fiscais.",
      "Legítimo interesse (inciso IX): para prevenir fraudes, limitar tentativas abusivas e manter o site seguro, sempre respeitando seus direitos.",
      "Consentimento (inciso I): quando pedirmos sua autorização para algo além disso, como receber novidades. Você pode revogá-lo quando quiser.",
    ],
  },
  {
    id: "menores",
    title: "Crianças e adolescentes",
    paragraphs: [
      "Quando a prova aceitar atletas menores de 18 anos, a inscrição deve ser feita ou autorizada por um dos pais ou pelo responsável legal, e os dados do menor são tratados no seu melhor interesse, como determina o art. 14 da LGPD. Pedimos apenas o necessário para a participação na prova.",
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
    id: "transferencia-internacional",
    title: "Transferência internacional",
    paragraphs: [
      "Alguns prestadores de serviço, como a hospedagem do site, podem manter servidores fora do Brasil. Nesses casos, a transferência acontece apenas para empresas que oferecem proteção adequada aos dados, nos termos dos arts. 33 a 36 da LGPD.",
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
