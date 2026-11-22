import "server-only"

import { PAYMENT_STATUS } from "@/enums/payment-status.enum"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

import { addDays, toFortalezaIso } from "./mock-time"
import type { MockPayment, MockRegistration } from "./mock-types"

/** Corrida com inscritos no seed (evento 1, "Corrida Vertex Beira-Mar 2026"). */
export const SEED_REGISTRATIONS_EVENT_ID = 1

const NAMES = [
  "Ana Beatriz Lima",
  "Bruno Carvalho Souza",
  "Carla Mendes Rocha",
  "Daniel Araújo Costa",
  "Eduarda Pinheiro Alves",
  "Felipe Nogueira Dias",
  "Gabriela Sampaio Freitas",
  "Henrique Barros Moreira",
  "Isabela Fontenele Cruz",
  "João Victor Holanda",
  "Larissa Monteiro Gomes",
  "Marcos Tavares Leite",
  "Natália Brandão Pires",
  "Otávio Cavalcante Melo",
  "Patrícia Queiroz Bezerra",
  "Rafael Teixeira Farias",
  "Sabrina Coelho Maia",
  "Thiago Albuquerque Ramos",
  "Úrsula Diniz Martins",
  "Vinícius Saraiva Paiva",
  "Wesley Bastos Fernandes",
  "Yasmin Castelo Branco",
  "Zeca Moura Lopes",
  "Maria das Graças Silveira",
] as const

/** Status por posição; o resto é `confirmada`. */
const STATUS_BY_INDEX: Partial<Record<number, REGISTRATION_STATUS>> = {
  18: REGISTRATION_STATUS.PENDING,
  19: REGISTRATION_STATUS.PENDING,
  20: REGISTRATION_STATUS.CANCELLED,
  21: REGISTRATION_STATUS.EXPIRED,
  22: REGISTRATION_STATUS.REFUNDED,
}

const PAYMENT_BY_STATUS: Record<REGISTRATION_STATUS, PAYMENT_STATUS> = {
  [REGISTRATION_STATUS.CONFIRMED]: PAYMENT_STATUS.APPROVED,
  [REGISTRATION_STATUS.PENDING]: PAYMENT_STATUS.PENDING,
  [REGISTRATION_STATUS.CANCELLED]: PAYMENT_STATUS.CANCELLED,
  [REGISTRATION_STATUS.EXPIRED]: PAYMENT_STATUS.EXPIRED,
  [REGISTRATION_STATUS.REFUNDED]: PAYMENT_STATUS.REFUNDED,
}

/** Inscrições com o kit já retirado no seed. */
const PICKED_UP = new Set([0, 1, 2])

/** Posições com pendência na fila de pagamentos (`GET /admin/pagamentos`). */
export const SEED_PAYMENT_ISSUES = {
  /** Pendente com pagamento em análise no Mercado Pago (conciliar confirma). */
  underReview: 19,
  /** Cancelada pelo admin com pagamento aprovado: estorno sinalizado, aguardando. */
  refundPending: 20,
  /** Confirmada, mas o valor recebido do gateway difere do cobrado. */
  mismatch: 17,
} as const

const TIERS = [
  { distanciaId: 1, precoCentavos: 8990 },
  { distanciaId: 2, precoCentavos: 9990 },
  { distanciaId: 3, precoCentavos: 6990 },
]
const KITS = [
  { kitId: 1, precoCentavos: 5000 },
  { kitId: 2, precoCentavos: 3000 },
  null,
]

function checkDigit(digits: number[]): number {
  const factor = digits.length + 1
  const total = digits.reduce((sum, digit, index) => sum + digit * (factor - index), 0)
  const rest = (total * 10) % 11
  return rest === 10 ? 0 : rest
}

/** CPF válido e determinístico (base `7xx…`), fora dos CPFs fixos usados nos testes. */
function seedCpf(index: number): string {
  const base = `7${String(index + 10).padStart(2, "0")}${String(index * 37 + 101).padStart(6, "0")}`.slice(0, 9)
  const digits = base.split("").map(Number)
  const first = checkDigit(digits)
  return [...digits, first, checkDigit([...digits, first])].join("")
}

function toEmail(name: string): string {
  const [first, ...rest] = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/\s+/)
  return `${first}.${rest.at(-1)}@exemplo.com`
}

/** Inscritos de demonstração da corrida 1, com pagamentos e as pendências da fila do admin. */
export function seedRegistrations(now: Date): { registrations: MockRegistration[]; payments: MockPayment[] } {
  const registrations: MockRegistration[] = []
  const payments: MockPayment[] = []

  NAMES.forEach((nomeCompleto, index) => {
    const id = index + 1
    const status = STATUS_BY_INDEX[index] ?? REGISTRATION_STATUS.CONFIRMED
    const tier = TIERS[index % TIERS.length]
    const kit = KITS[index % KITS.length]
    const inscritoEm = toFortalezaIso(addDays(now, -(40 - index)))
    const valorBaseCentavos = tier.precoCentavos + (kit?.precoCentavos ?? 0)
    const paymentStatus =
      index === SEED_PAYMENT_ISSUES.underReview
        ? PAYMENT_STATUS.UNDER_REVIEW
        : index === SEED_PAYMENT_ISSUES.refundPending
          ? PAYMENT_STATUS.APPROVED
          : PAYMENT_BY_STATUS[status]
    const settled = status !== REGISTRATION_STATUS.PENDING
    const changedAt = toFortalezaIso(addDays(now, -(40 - index) + 0.01))

    registrations.push({
      id,
      codigo: `VX-2026-${String(id).padStart(8, "0")}`,
      referencia: `seed-ref-${id}`,
      accessToken: `seed-token-${id}`,
      eventoId: SEED_REGISTRATIONS_EVENT_ID,
      distanciaId: tier.distanciaId,
      kitId: kit?.kitId ?? null,
      tamanhoCamisaId: kit ? (index % 5) + 1 : null,
      nomeCompleto,
      dataNascimento: `${1970 + (index % 30)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
      cpf: index % 4 === 3 ? null : seedCpf(index),
      whatsapp: `+55859${String(70_000_000 + index * 1_234_567).slice(0, 8)}`,
      email: index % 3 === 2 ? null : toEmail(nomeCompleto),
      documentosAceitos: [101, 102],
      status,
      valorBaseCentavos,
      valorDescontoCentavos: 0,
      valorTotalCentavos: valorBaseCentavos,
      inscritoEm,
      pagamentoStatus: paymentStatus,
      aprovacaoEm: null,
      kitRetiradoEm: PICKED_UP.has(index) ? toFortalezaIso(addDays(now, -1)) : null,
      historico: settled
        ? [
            { status: REGISTRATION_STATUS.PENDING, em: inscritoEm },
            { status, em: changedAt },
          ]
        : [{ status: REGISTRATION_STATUS.PENDING, em: inscritoEm }],
    })

    const approved = paymentStatus === PAYMENT_STATUS.APPROVED || paymentStatus === PAYMENT_STATUS.REFUNDED
    payments.push({
      id,
      inscricaoId: id,
      pedidoLojaCodigo: null,
      status: paymentStatus,
      valorCentavos: valorBaseCentavos,
      valorGatewayCentavos:
        index === SEED_PAYMENT_ISSUES.mismatch ? valorBaseCentavos - 1000 : approved ? valorBaseCentavos : null,
      criadoEm: inscritoEm,
      atualizadoEm: settled ? changedAt : inscritoEm,
      pagoEm: approved ? changedAt : null,
      estornoSolicitadoEm: index === SEED_PAYMENT_ISSUES.refundPending ? changedAt : null,
      estornoMotivo: index === SEED_PAYMENT_ISSUES.refundPending ? "Inscrição cancelada pelo admin" : null,
    })
  })

  return { registrations, payments }
}
