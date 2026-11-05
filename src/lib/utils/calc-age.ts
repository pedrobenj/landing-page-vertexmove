import { differenceInYears } from "date-fns"

/** Idade completa do atleta na data de referência (por padrão, hoje). Use a data da prova nas regras de negócio. */
export function calcAge(birthDate: Date | string, onDate: Date | string = new Date()): number {
  return differenceInYears(new Date(onDate), new Date(birthDate))
}
