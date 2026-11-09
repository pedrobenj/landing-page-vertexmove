import { z } from "zod"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"

import { fortalezaDateTimeField, urlField } from "./form-fields"

/**
 * Nova versão de documento (regulamento ou termo). Chaves de `POST /admin/documentos`, sem `eventoId`
 * (vem da rota, no servidor). Documentos são imutáveis: não há edição.
 */
export const documentFormSchema = z.object({
  tipo: z.enum(DOCUMENT_TYPE, { error: "Escolha o tipo" }),
  versao: z.string().trim().min(1, "Informe a versão (ex.: 1.0)").max(20, "Versão com no máximo 20 caracteres"),
  titulo: z.string().trim().min(1, "Informe o título").max(150, "Título com no máximo 150 caracteres"),
  url: urlField,
  hashSha256: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-f0-9]{64}$/, "O hash SHA-256 tem 64 caracteres (0-9 e a-f)"),
  vigenteEm: fortalezaDateTimeField("Informe a partir de quando vale"),
})

export type DocumentFormInput = z.input<typeof documentFormSchema>
export type DocumentFormData = z.output<typeof documentFormSchema>
