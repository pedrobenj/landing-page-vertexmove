import type { PartnerRaceFormInput } from "@/lib/validations/partner-race.schema"
import type { AdminPartnerRace } from "@/types/api/partner-race.interface"

export function getEmptyPartnerRaceForm(): PartnerRaceFormInput {
  return {
    nome: "",
    dataEvento: "",
    localNome: "",
    cidade: "Fortaleza",
    uf: "CE",
    distancias: "",
    cupom: "",
    descontoPercentual: "",
    realizacao: "",
    urlInscricao: "",
    imagemCapaUrl: "",
    ordem: "0",
    ativo: true,
  }
}

export function toPartnerRaceFormValues(race: AdminPartnerRace): PartnerRaceFormInput {
  return {
    nome: race.nome,
    dataEvento: race.dataEvento,
    localNome: race.localNome,
    cidade: race.cidade,
    uf: race.uf,
    distancias: race.distancias.join(", "),
    cupom: race.cupom,
    descontoPercentual: String(race.descontoPercentual),
    realizacao: race.realizacao ?? "",
    urlInscricao: race.urlInscricao,
    imagemCapaUrl: race.imagemCapaUrl ?? "",
    ordem: String(race.ordem),
    ativo: race.ativo,
  }
}
