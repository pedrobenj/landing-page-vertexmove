import { describe, expect, it } from "vitest"

import { EVENT_STATUS } from "@/enums/event-status.enum"
import { adminEventFormSchema } from "@/lib/validations/admin-event.schema"
import type { AdminEvent } from "@/types/api/admin-event.interface"

import { toAdminEventFormValues } from "./admin-event-form-values"

/** `GET /admin/eventos/:id` do backend (`presentEventoAdminDetalhado`): local só em `localizacao`. */
const event: AdminEvent = {
  id: 7,
  status: EVENT_STATUS.DRAFT,
  slug: "corrida-teste",
  nome: "Corrida Teste",
  descricao: "Descrição.",
  dataEvento: "2026-12-06",
  horarioLargada: "05:30",
  localizacao: {
    localNome: "Aterrinho",
    endereco: "Av. Almirante Tamandaré, s/n",
    complemento: null,
    bairro: "Praia de Iracema",
    cidade: "Fortaleza",
    uf: "CE",
    cep: "60165121",
    latitude: -3.7253,
    longitude: null,
  },
  localizacaoResumo: "Aterrinho — Praia de Iracema, Fortaleza/CE",
  imagemCapaUrl: null,
  galeriaUrl: null,
  retiradaKit: {
    local: "Loja Vertex",
    endereco: null,
    inicio: "2026-12-04T12:00:00.000Z",
    fim: "2026-12-05T21:00:00.000Z",
    instrucoes: "Leve documento.",
  },
}

describe("toAdminEventFormValues", () => {
  it("converte null em vazio e números em texto", () => {
    const values = toAdminEventFormValues(event)
    expect(values).toMatchObject({ complemento: "", bairro: "Praia de Iracema", latitude: "-3.7253", longitude: "" })
  })

  it("lê o local de `localizacao` e a retirada de `retiradaKit` (horário de Fortaleza)", () => {
    expect(toAdminEventFormValues(event)).toMatchObject({
      localNome: "Aterrinho",
      endereco: "Av. Almirante Tamandaré, s/n",
      cep: "60165121",
      retiradaKitLocal: "Loja Vertex",
      retiradaKitEndereco: "",
      retiradaKitInicio: "2026-12-04T09:00",
      retiradaKitFim: "2026-12-05T18:00",
      retiradaKitInstrucoes: "Leve documento.",
    })
    expect(toAdminEventFormValues({ ...event, retiradaKit: null })).toMatchObject({ retiradaKitLocal: "", retiradaKitInicio: "" })
  })

  it("ida e volta pelo schema devolve o corpo do PATCH", () => {
    const parsed = adminEventFormSchema.parse(toAdminEventFormValues(event))
    expect(parsed).toMatchObject({ ...event.localizacao, slug: event.slug, retiradaKitLocal: "Loja Vertex", retiradaKitEndereco: null })
    expect(Date.parse(parsed.retiradaKitInicio ?? "")).toBe(Date.parse("2026-12-04T12:00:00.000Z"))
  })
})
