import { z } from "zod"

/** Id numérico da API (inteiro positivo). */
export const apiIdSchema = z.number().int().positive()
