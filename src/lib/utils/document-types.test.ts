import { describe, expect, it } from "vitest"

import { DOCUMENT_TYPE } from "@/enums/document-type.enum"
import type { EventDocument } from "@/types/api/document.interface"

import { getDocumentTypeLabel, groupDocumentsByType } from "./document-types"

const doc = (id: number, tipo: DOCUMENT_TYPE, vigenteEm: string): EventDocument => ({
  id,
  eventoId: 4,
  tipo,
  versao: `v${id}`,
  titulo: `Doc ${id}`,
  url: "https://example.com/doc.pdf",
  hashSha256: "a".repeat(64),
  vigenteEm,
})

describe("groupDocumentsByType", () => {
  const now = new Date("2026-11-09T12:00:00-03:00")

  it("agrupa os dois tipos, mais novos primeiro, e marca a versão vigente", () => {
    const groups = groupDocumentsByType(
      [
        doc(1, DOCUMENT_TYPE.REGULATION, "2026-01-01T00:00:00-03:00"),
        doc(2, DOCUMENT_TYPE.REGULATION, "2026-10-01T00:00:00-03:00"),
        doc(3, DOCUMENT_TYPE.REGULATION, "2026-12-01T00:00:00-03:00"),
      ],
      now,
    )
    expect(groups.map((group) => group.tipo)).toEqual([DOCUMENT_TYPE.REGULATION, DOCUMENT_TYPE.LIABILITY_TERM])
    expect(groups[0].documents.map((document) => document.id)).toEqual([3, 2, 1])
    // A v3 ainda não entrou em vigor.
    expect(groups[0].currentId).toBe(2)
    expect(groups[1]).toMatchObject({ documents: [], currentId: null })
  })

  it("rótulos", () => {
    expect(getDocumentTypeLabel(DOCUMENT_TYPE.LIABILITY_TERM)).toBe("Termo de responsabilidade")
    expect(getDocumentTypeLabel("outro")).toBe("outro")
  })
})
