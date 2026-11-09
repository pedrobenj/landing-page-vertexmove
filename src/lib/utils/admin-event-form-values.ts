import type { AdminEventFormInput } from "@/lib/validations/admin-event.schema"
import type { AdminEvent } from "@/types/api/admin-event.interface"

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
}

const text = (value: string | null | undefined) => value ?? ""
const coordinate = (value: number | null | undefined) => (value === null || value === undefined ? "" : String(value))

/** Corrida da API → valores do formulário (tudo texto; `null` vira vazio). */
export function toAdminEventFormValues(event: AdminEvent): AdminEventFormInput {
  return {
    slug: event.slug,
    nome: event.nome,
    descricao: event.descricao,
    dataEvento: event.dataEvento,
    horarioLargada: event.horarioLargada,
    localNome: event.localNome,
    endereco: text(event.endereco),
    complemento: text(event.complemento),
    bairro: text(event.bairro),
    cidade: event.cidade,
    uf: event.uf,
    cep: text(event.cep),
    latitude: coordinate(event.latitude),
    longitude: coordinate(event.longitude),
    imagemCapaUrl: text(event.imagemCapaUrl),
    galeriaUrl: text(event.galeriaUrl),
  }
}
