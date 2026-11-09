import type { DistanceFormInput } from "@/lib/validations/distance.schema"
import type { Distance } from "@/types/api/distance.interface"

/** Formulário vazio de nova distância; a ordem sugerida vem depois das existentes. */
export function getEmptyDistanceForm(nextOrder: number): DistanceFormInput {
  return {
    nome: "",
    descricao: "",
    distanciaMetros: "",
    capacidadeTotal: "",
    horarioLargada: "",
    percursoUrl: "",
    ordem: String(nextOrder),
    ativo: true,
  }
}

/** Distância da API → valores do formulário. */
export function toDistanceFormValues(distance: Distance): DistanceFormInput {
  return {
    nome: distance.nome,
    descricao: distance.descricao ?? "",
    distanciaMetros: String(distance.distanciaMetros),
    capacidadeTotal: String(distance.capacidadeTotal),
    horarioLargada: distance.horarioLargada ?? "",
    percursoUrl: distance.percursoUrl ?? "",
    ordem: String(distance.ordem),
    ativo: distance.ativo,
  }
}
