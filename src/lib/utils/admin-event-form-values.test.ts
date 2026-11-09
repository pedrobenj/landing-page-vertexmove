import { describe, expect, it } from "vitest"

import { EVENT_STATUS } from "@/enums/event-status.enum"
import { adminEventFormSchema } from "@/lib/validations/admin-event.schema"
import type { AdminEvent } from "@/types/api/admin-event.interface"

import { toAdminEventFormValues } from "./admin-event-form-values"

const event: AdminEvent = {
  id: 7,
  status: EVENT_STATUS.DRAFT,
  slug: "corrida-teste",
  nome: "Corrida Teste",
  descricao: "Descrição.",
  dataEvento: "2026-12-06",
  horarioLargada: "05:30",
  localNome: "Aterrinho",
  endereco: null,
  complemento: null,
  bairro: "Praia de Iracema",
  cidade: "Fortaleza",
  uf: "CE",
  cep: "60165121",
  latitude: -3.7253,
  longitude: null,
  imagemCapaUrl: null,
  galeriaUrl: null,
  localizacao: { localNome: "Aterrinho", cidade: "Fortaleza", uf: "CE" },
  localizacaoResumo: "Aterrinho · Fortaleza/CE",
}

describe("toAdminEventFormValues", () => {
  it("converte null em vazio e números em texto", () => {
    const values = toAdminEventFormValues(event)
    expect(values).toMatchObject({ endereco: "", bairro: "Praia de Iracema", latitude: "-3.7253", longitude: "" })
  })

  it("ida e volta pelo schema devolve os campos editáveis", () => {
    const parsed = adminEventFormSchema.parse(toAdminEventFormValues(event))
    expect(event).toMatchObject(parsed)
    expect(Object.keys(parsed)).toHaveLength(Object.keys(event).length - 4) // sem id, status e localização
  })
})
