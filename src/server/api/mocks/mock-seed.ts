import "server-only"

import { createHash } from "node:crypto"

import { ADMIN_ROLE } from "@/enums/admin-role.enum"
import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"
import type { AuditEntry } from "@/types/api/audit-entry.interface"
import type { EventDocument } from "@/types/api/document.interface"
import type { Kit } from "@/types/api/kit.interface"
import type { PartnerRace } from "@/types/api/partner-race.interface"
import type { PriceTier } from "@/types/api/price-tier.interface"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

import { addDays, toFortalezaIso } from "./mock-time"
import type { MockDb, MockDistance, MockEvent } from "./mock-types"

/** Senha das contas de desenvolvimento (igual ao seed do backend). */
export const MOCK_ADMIN_PASSWORD = "Vertex@Dev12345"

interface PlaceSeed {
  localNome: string
  endereco: string
  bairro: string
  cep: string
  latitude: number
  longitude: number
}

const PLACES = {
  aterrinho: {
    localNome: "Aterrinho da Praia de Iracema",
    endereco: "Av. Almirante Tamandaré, s/n",
    bairro: "Praia de Iracema",
    cep: "60060590",
    latitude: -3.7197,
    longitude: -38.5147,
  },
  aterro: {
    localNome: "Aterro da Praia de Iracema",
    endereco: "Av. Historiador Raimundo Girão, s/n",
    bairro: "Praia de Iracema",
    cep: "60165050",
    latitude: -3.7226,
    longitude: -38.5106,
  },
  coco: {
    localNome: "Parque Estadual do Cocó",
    endereco: "Av. Padre Antônio Tomás, s/n",
    bairro: "Cocó",
    cep: "60192120",
    latitude: -3.7454,
    longitude: -38.4842,
  },
  beiraMar: {
    localNome: "Calçadão da Beira-Mar (Volta da Jurema)",
    endereco: "Av. Beira Mar, s/n",
    bairro: "Meireles",
    cep: "60165121",
    latitude: -3.7253,
    longitude: -38.4970,
  },
  pracaPortugal: {
    localNome: "Praça Portugal",
    endereco: "Av. Dom Luís, s/n",
    bairro: "Aldeota",
    cep: "60160230",
    latitude: -3.7357,
    longitude: -38.4950,
  },
} satisfies Record<string, PlaceSeed>

function buildEvent(
  id: number,
  status: EVENT_STATUS,
  data: Pick<MockEvent, "slug" | "nome" | "descricao" | "dataEvento" | "horarioLargada">,
  place: PlaceSeed,
): MockEvent {
  return {
    id,
    status,
    deletedAt: null,
    ...data,
    ...place,
    complemento: null,
    cidade: "Fortaleza",
    uf: "CE",
    imagemCapaUrl: null,
    galeriaUrl: null,
  }
}

function seedEvents(): MockEvent[] {
  const { PUBLISHED, DRAFT, CLOSED } = EVENT_STATUS
  return [
    buildEvent(
      1,
      PUBLISHED,
      {
        slug: "corrida-vertex-beira-mar-2026",
        nome: "Corrida Vertex Beira-Mar 2026",
        descricao:
          "A corrida mais tradicional do Vertex, com largada ao nascer do sol e percurso plano pela orla de Fortaleza.",
        dataEvento: "2026-12-06",
        horarioLargada: "05:30",
      },
      PLACES.aterrinho,
    ),
    buildEvent(
      2,
      PUBLISHED,
      {
        slug: "night-run-vertex-aterro",
        nome: "Night Run Vertex",
        descricao: "Corrida noturna com percurso iluminado pelo Aterro e pela Praia de Iracema. Traga sua lanterna!",
        dataEvento: "2027-01-23",
        horarioLargada: "19:00",
      },
      PLACES.aterro,
    ),
    buildEvent(
      3,
      PUBLISHED,
      {
        slug: "desafio-vertex-parque-do-coco",
        nome: "Desafio Vertex Parque do Cocó",
        descricao: "Percurso misto entre asfalto e trilha leve no maior parque urbano de Fortaleza.",
        dataEvento: "2027-03-14",
        horarioLargada: "06:00",
      },
      PLACES.coco,
    ),
    buildEvent(
      4,
      DRAFT,
      {
        slug: "corrida-de-natal-vertex-2026",
        nome: "Corrida de Natal Vertex 2026",
        descricao: "Corrida temática de Natal, com fantasias liberadas e arrecadação de brinquedos.",
        dataEvento: "2026-12-20",
        horarioLargada: "05:30",
      },
      PLACES.pracaPortugal,
    ),
    buildEvent(
      5,
      CLOSED,
      {
        slug: "corrida-vertex-beira-mar-2025",
        nome: "Corrida Vertex Beira-Mar 2025",
        descricao: "Edição 2025 da corrida tradicional do Vertex na orla de Fortaleza.",
        dataEvento: "2025-12-07",
        horarioLargada: "05:30",
      },
      PLACES.aterrinho,
    ),
    buildEvent(
      6,
      CLOSED,
      {
        slug: "night-run-vertex-2025",
        nome: "Night Run Vertex 2025",
        descricao: "Primeira edição da corrida noturna do Vertex.",
        dataEvento: "2025-08-16",
        horarioLargada: "19:00",
      },
      PLACES.aterro,
    ),
    buildEvent(
      7,
      CLOSED,
      {
        slug: "vertex-coco-trail-2026",
        nome: "Vertex Cocó Trail 2026",
        descricao: "Corrida em trilha leve pelo Parque do Cocó.",
        dataEvento: "2026-03-15",
        horarioLargada: "06:00",
      },
      PLACES.coco,
    ),
    buildEvent(
      8,
      CLOSED,
      {
        slug: "corrida-das-maes-vertex-2026",
        nome: "Corrida das Mães Vertex 2026",
        descricao: "Corrida e caminhada em homenagem às mães, com percurso pela Beira-Mar.",
        dataEvento: "2026-05-10",
        horarioLargada: "06:00",
      },
      PLACES.beiraMar,
    ),
  ]
}

const DISTANCE_TEMPLATES = [
  { nome: "5 km", distanciaMetros: 5000, capacidadeTotal: 400, precoCentavos: 8990, ordem: 1 },
  { nome: "10 km", distanciaMetros: 10000, capacidadeTotal: 300, precoCentavos: 9990, ordem: 2 },
  { nome: "Caminhada 3 km", distanciaMetros: 3000, capacidadeTotal: 200, precoCentavos: 6990, ordem: 3 },
]

const SECOND_TIER_INCREASE = 2000

/** No evento 2, a distância de 10 km já está lotada. */
const SOLD_OUT = { eventoId: 2, nome: "10 km" }

function seedDistancesAndTiers(events: MockEvent[], now: Date): { distances: MockDistance[]; priceTiers: PriceTier[] } {
  const distances: MockDistance[] = []
  const priceTiers: PriceTier[] = []
  const currentStart = toFortalezaIso(addDays(now, -30))
  const currentEnd = toFortalezaIso(addDays(now, 45))
  const futureEnd = toFortalezaIso(addDays(now, 120))

  for (const event of events) {
    for (const template of DISTANCE_TEMPLATES) {
      const id = distances.length + 1
      const soldOut = event.id === SOLD_OUT.eventoId && template.nome === SOLD_OUT.nome
      distances.push({
        id,
        eventoId: event.id,
        nome: template.nome,
        descricao: null,
        distanciaMetros: template.distanciaMetros,
        capacidadeTotal: template.capacidadeTotal,
        horarioLargada: null,
        percursoUrl: null,
        ordem: template.ordem,
        ativo: true,
        vagasOcupadasSeed: soldOut ? template.capacidadeTotal : 0,
      })
      priceTiers.push(
        {
          id: priceTiers.length + 1,
          distanciaId: id,
          nome: "1º lote",
          precoCentavos: template.precoCentavos,
          inicioEm: currentStart,
          fimEm: currentEnd,
          quantidadeTotal: null,
          ordem: 1,
          ativo: true,
        },
        {
          id: priceTiers.length + 2,
          distanciaId: id,
          nome: "2º lote",
          precoCentavos: template.precoCentavos + SECOND_TIER_INCREASE,
          inicioEm: currentEnd,
          fimEm: futureEnd,
          quantidadeTotal: null,
          ordem: 2,
          ativo: true,
        },
      )
    }
  }
  return { distances, priceTiers }
}

function seedKits(events: MockEvent[]): Kit[] {
  return events.flatMap((event, index) => [
    {
      id: index * 2 + 1,
      eventoId: event.id,
      nome: "Kit Básico",
      descricao: "Camisa, número de peito e medalha de finisher.",
      ativo: true,
      fotos: [],
    },
    {
      id: index * 2 + 2,
      eventoId: event.id,
      nome: "Kit Premium",
      descricao: "Camisa, número de peito, medalha de finisher e viseira.",
      ativo: true,
      fotos: [],
    },
  ])
}

function seedShirtSizes(): ShirtSize[] {
  const sizes = [
    ["PP", "Extra pequeno"],
    ["P", "Pequeno"],
    ["M", "Médio"],
    ["G", "Grande"],
    ["GG", "Extra grande"],
    ["XGG", "Extra extra grande"],
  ]
  return sizes.map(([codigo, descricao], index) => ({ id: index + 1, codigo, descricao, ordem: index + 1, ativo: true }))
}

function fakeHash(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

function seedDocuments(events: MockEvent[], now: Date): EventDocument[] {
  const vigenteEm = toFortalezaIso(addDays(now, -60))
  return events.flatMap((event, index) => [
    {
      id: 101 + index * 2,
      eventoId: event.id,
      tipo: DOCUMENT_TYPE.REGULATION,
      versao: "1.0",
      titulo: `Regulamento — ${event.nome}`,
      url: "https://example.com/regulamento.pdf",
      hashSha256: fakeHash(`regulamento-${event.slug}`),
      vigenteEm,
    },
    {
      id: 102 + index * 2,
      eventoId: event.id,
      tipo: DOCUMENT_TYPE.LIABILITY_TERM,
      versao: "1.0",
      titulo: `Termo de responsabilidade — ${event.nome}`,
      url: "https://example.com/termo-de-responsabilidade.pdf",
      hashSha256: fakeHash(`termo-${event.slug}`),
      vigenteEm,
    },
  ])
}

function seedAudit(now: Date): AuditEntry[] {
  const entries: Array<Pick<AuditEntry, "acao" | "entidade" | "entidadeId"> & { daysAgo: number }> = [
    { acao: "evento.criado", entidade: "evento", entidadeId: "1", daysAgo: 40 },
    { acao: "evento.publicado", entidade: "evento", entidadeId: "1", daysAgo: 38 },
    { acao: "evento.criado", entidade: "evento", entidadeId: "2", daysAgo: 20 },
    { acao: "evento.publicado", entidade: "evento", entidadeId: "2", daysAgo: 19 },
    { acao: "evento.criado", entidade: "evento", entidadeId: "4", daysAgo: 2 },
  ]
  return entries.map(({ daysAgo, ...entry }, index) => ({
    id: index + 1,
    ...entry,
    adminNome: "Organização Vertex",
    criadoEm: toFortalezaIso(addDays(now, -daysAgo)),
  }))
}

/** Corridas de outras organizações (fictícias), com cupom exclusivo do Vertex. */
function seedPartnerRaces(): PartnerRace[] {
  return [
    {
      id: 1,
      nome: "Corrida da Lagoa de Messejana",
      dataEvento: "2026-12-13",
      localNome: "Lagoa de Messejana",
      cidade: "Fortaleza",
      uf: "CE",
      distancias: ["5 km", "10 km"],
      cupom: "VERTEX10",
      descontoPercentual: 10,
      realizacao: "Assessoria Passo Firme",
      urlInscricao: "https://example.com/corridas/lagoa-de-messejana",
      imagemCapaUrl: null,
    },
    {
      id: 2,
      nome: "Meia Maratona do Pôr do Sol",
      dataEvento: "2027-02-07",
      localNome: "Ponte dos Ingleses",
      cidade: "Fortaleza",
      uf: "CE",
      distancias: ["5 km", "10 km", "21 km"],
      cupom: "VERTEX10",
      descontoPercentual: 10,
      realizacao: "Clube de Corrida Maré Alta",
      urlInscricao: "https://example.com/corridas/meia-do-por-do-sol",
      imagemCapaUrl: null,
    },
    {
      id: 3,
      nome: "Corrida Noturna do Centro Histórico",
      dataEvento: "2027-04-18",
      localNome: "Praça do Ferreira",
      cidade: "Fortaleza",
      uf: "CE",
      distancias: ["3 km", "7 km"],
      cupom: "VERTEX10",
      descontoPercentual: 10,
      realizacao: null,
      urlInscricao: "https://example.com/corridas/noturna-centro-historico",
      imagemCapaUrl: null,
    },
  ]
}

export function createSeed(now: Date = new Date()): MockDb {
  const events = seedEvents()
  const { distances, priceTiers } = seedDistancesAndTiers(events, now)
  return {
    events,
    distances,
    priceTiers,
    kits: seedKits(events),
    shirtSizes: seedShirtSizes(),
    documents: seedDocuments(events, now),
    admins: [
      {
        id: 1,
        nome: "Organização Vertex",
        email: "admin@example.com",
        senha: MOCK_ADMIN_PASSWORD,
        papel: ADMIN_ROLE.ORGANIZATION,
        mfaAtivo: false,
      },
      {
        id: 2,
        nome: "Operador Vertex",
        email: "operador@example.com",
        senha: MOCK_ADMIN_PASSWORD,
        papel: ADMIN_ROLE.OPERATOR,
        mfaAtivo: false,
      },
      {
        id: 3,
        nome: "Super Admin",
        email: "superadmin@example.com",
        senha: MOCK_ADMIN_PASSWORD,
        papel: ADMIN_ROLE.SUPER_ADMIN,
        mfaAtivo: true,
      },
    ],
    registrations: [],
    audit: seedAudit(now),
    partnerRaces: seedPartnerRaces(),
    loginFailures: {},
  }
}
