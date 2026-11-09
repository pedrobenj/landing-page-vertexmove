import type { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { DocumentFormInput } from "@/lib/validations/document.schema"

/** Formulário de nova versão, com o tipo da seção já escolhido. */
export function getEmptyDocumentForm(tipo: DOCUMENT_TYPE): DocumentFormInput {
  return { tipo, versao: "", titulo: "", url: "", hashSha256: "", vigenteEm: "" }
}
