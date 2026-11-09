import { describe, expect, it } from "vitest"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"

import { documentFormSchema, type DocumentFormInput } from "./document.schema"

const valid: DocumentFormInput = {
  tipo: DOCUMENT_TYPE.REGULATION,
  versao: "2.0",
  titulo: "Regulamento oficial",
  url: "https://cdn.example.com/regulamento-v2.pdf",
  hashSha256: ` ${"AB12".repeat(16)} `,
  vigenteEm: "2026-11-10T00:00",
}

const errorPaths = (input: DocumentFormInput) => {
  const result = documentFormSchema.safeParse(input)
  return result.success ? [] : [...new Set(result.error.issues.map((issue) => issue.path.join(".")))]
}

describe("documentFormSchema", () => {
  it("normaliza o hash e converte a vigência", () => {
    expect(documentFormSchema.parse(valid)).toMatchObject({
      hashSha256: "ab12".repeat(16),
      vigenteEm: "2026-11-10T00:00:00-03:00",
    })
  })

  it("hash obrigatório com 64 hexadecimais", () => {
    expect(errorPaths({ ...valid, hashSha256: "" })).toEqual(["hashSha256"])
    expect(errorPaths({ ...valid, hashSha256: "g".repeat(64) })).toEqual(["hashSha256"])
    expect(errorPaths({ ...valid, hashSha256: "a".repeat(63) })).toEqual(["hashSha256"])
  })

  it("tipo, URL e vigência obrigatórios", () => {
    // @ts-expect-error tipo fora do enum
    expect(errorPaths({ ...valid, tipo: "contrato" })).toEqual(["tipo"])
    expect(errorPaths({ ...valid, url: "" })).toEqual(["url"])
    expect(errorPaths({ ...valid, vigenteEm: "" })).toEqual(["vigenteEm"])
  })
})
