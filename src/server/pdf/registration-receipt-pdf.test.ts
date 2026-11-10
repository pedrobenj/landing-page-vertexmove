import { PDFDocument } from "pdf-lib"
import { describe, expect, it } from "vitest"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import type { RegistrationReceipt } from "@/types/api/registration-receipt.interface"

import { buildRegistrationReceiptPdf, getReceiptFileName } from "./registration-receipt-pdf"

const receipt: RegistrationReceipt = {
  codigo: "VX-2026-00000042",
  status: REGISTRATION_STATUS.PENDING,
  nomeCompleto: "Ana Maria Conceição",
  cpfMascarado: "***.982.247-**",
  evento: {
    nome: "Corrida Vertex Beira-Mar 2026",
    dataEvento: "2026-12-06",
    horarioLargada: "05:30",
    localizacaoResumo: "Aterrinho da Praia de Iracema — Fortaleza/CE",
  },
  distancia: "5 km",
  kit: "Kit Camisa + Medalha",
  tamanhoCamisa: "M",
  valorBaseCentavos: 13990,
  valorDescontoCentavos: 4495,
  valorTotalCentavos: 9495,
  inscritoEm: "2026-11-09T10:00:00-03:00",
}

describe("buildRegistrationReceiptPdf", () => {
  it("gera um PDF de uma página com o título do comprovante", async () => {
    const bytes = await buildRegistrationReceiptPdf(receipt, new Date("2026-11-10T12:00:00-03:00"))
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-")

    const pdf = await PDFDocument.load(bytes)
    expect(pdf.getPageCount()).toBe(1)
    expect(pdf.getTitle()).toBe("Comprovante de inscrição VX-2026-00000042")
  })

  it("não quebra com caracteres fora da fonte (ex.: emoji no nome) nem sem kit/CPF", async () => {
    const bytes = await buildRegistrationReceiptPdf({
      ...receipt,
      status: REGISTRATION_STATUS.CONFIRMED,
      nomeCompleto: "Ana 🏃 Silva",
      cpfMascarado: null,
      kit: null,
      tamanhoCamisa: null,
      valorDescontoCentavos: 0,
    })
    expect(bytes.length).toBeGreaterThan(1_000)
  })

  it("nomeia o arquivo pelo código", () => {
    expect(getReceiptFileName("VX-2026-00000042")).toBe("comprovante-VX-2026-00000042.pdf")
  })
})
