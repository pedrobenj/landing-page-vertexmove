export interface EventFaqEntry {
  question: string
  answer: string
}

/**
 * Perguntas frequentes genéricas da página do evento.
 * TODO(cliente): substituir pelos textos oficiais do Vertex (retirada de kit, cancelamento, idade mínima…).
 */
export const EVENT_FAQ: readonly EventFaqEntry[] = [
  {
    question: "Como faço para retirar o kit?",
    answer:
      "A retirada acontece em local e horário divulgados antes da prova. Leve um documento com foto e o código da sua inscrição. Terceiros podem retirar com autorização assinada e cópia do documento do atleta.",
  },
  {
    question: "Quais são as formas de pagamento?",
    answer:
      "Pix e cartão de crédito. A vaga fica reservada por alguns minutos enquanto o pagamento é concluído; depois disso, a inscrição pendente expira e a vaga é liberada.",
  },
  {
    question: "Posso cancelar ou transferir minha inscrição?",
    answer:
      "As condições de cancelamento, reembolso e transferência estão no regulamento da prova. Em caso de dúvida, fale com a gente pelo WhatsApp.",
  },
  {
    question: "Existe idade mínima para participar?",
    answer:
      "Sim. A idade mínima varia conforme a distância e é calculada na data da prova. Confira o regulamento antes de se inscrever.",
  },
  {
    question: "Como sei se minha inscrição foi confirmada?",
    answer:
      "Depois do pagamento, você pode acompanhar o status a qualquer momento em “Consultar inscrição”, informando o WhatsApp ou o CPF usados no cadastro.",
  },
]
