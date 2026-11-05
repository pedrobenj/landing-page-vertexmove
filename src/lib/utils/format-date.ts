import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TZDate } from "@date-fns/tz"

import { APP_TIME_ZONE } from "./constants"

/** Formata uma data no fuso de Fortaleza. Padrão: "15 de março de 2026". */
export function formatDate(date: Date | string, pattern = "d 'de' MMMM 'de' yyyy"): string {
  return format(new TZDate(new Date(date), APP_TIME_ZONE), pattern, { locale: ptBR })
}

/** "15/03/2026 às 05:30" */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm")
}
