import type { AdminEventFormInput } from "@/lib/validations/admin-event.schema"
import type { AdminEvent } from "@/types/api/admin-event.interface"

import { toFortalezaLocalInput } from "./fortaleza-datetime"

/** Formulário vazio de nova corrida (todos os `defaultValues` definidos). */
export const EMPTY_ADMIN_EVENT_FORM: AdminEventFormInput = {
  slug: "",
  nome: "",
  descricao: "",
  dataEvento: "",
  horarioLargada: "",
  localNome: "",
  endereco: "",
  complemento: "",
  bairro: "",
  cidade: "Fortaleza",
  uf: "CE",
  cep: "",
  latitude: "",
  longitude: "",
  imagemCapaUrl: "",
  galeriaUrl: "",
  retiradaKitLocal: "",
  retiradaKitEndereco: "",
  retiradaKitInicio: "",
  retiradaKitFim: "",
  retiradaKitInstrucoes: "",
}

const text = (value: string | null | undefined) => value ?? ""
const coordinate = (value: number | null | undefined) => (value === null || value === undefined ? "" : String(value))

const dateTime = (value: string | null | undefined) => (value ? toFortalezaLocalInput(value) : "")

/**
 * Corrida da API → valores do formulário (tudo texto; `null` vira vazio). O local vem de `localizacao` e a
 * retirada de `retiradaKit` (formato do detalhe admin do backend); os instantes viram hora de Fortaleza.
 */
export function toAdminEventFormValues(event: AdminEvent): AdminEventFormInput {
  const location = event.localizacao
  const pickup = event.retiradaKit
  return {
    slug: event.slug,
    nome: event.nome,
    descricao: event.descricao ?? "",
    dataEvento: event.dataEvento,
    horarioLargada: event.horarioLargada,
    localNome: location.localNome,
    endereco: text(location.endereco),
    complemento: text(location.complemento),
    bairro: text(location.bairro),
    cidade: location.cidade,
    uf: location.uf,
    cep: text(location.cep),
    latitude: coordinate(location.latitude),
    longitude: coordinate(location.longitude),
    imagemCapaUrl: text(event.imagemCapaUrl),
    galeriaUrl: text(event.galeriaUrl),
    retiradaKitLocal: text(pickup?.local),
    retiradaKitEndereco: text(pickup?.endereco),
    retiradaKitInicio: dateTime(pickup?.inicio),
    retiradaKitFim: dateTime(pickup?.fim),
    retiradaKitInstrucoes: text(pickup?.instrucoes),
  }
}
