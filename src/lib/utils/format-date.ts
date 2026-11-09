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

/**
 * Como `formatDateTime`, mas sem lançar erro: instante inválido vindo da API vira `fallback` (a página
 * não cai por um dado ruim).
 */
export function formatDateTimeSafe(date: Date | string, fallback = "data inválida"): string {
  return Number.isNaN(new Date(date).getTime()) ? fallback : formatDateTime(date)
}
