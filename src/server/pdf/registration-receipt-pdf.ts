import "server-only"

import { PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from "pdf-lib"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { formatApiDateLong } from "@/lib/utils/format-api-date"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatDateTime } from "@/lib/utils/format-date"
import { getRegistrationStatusLabel } from "@/lib/utils/status-labels"
import type { RegistrationReceipt } from "@/types/api/registration-receipt.interface"

const NAVY = rgb(11 / 255, 50 / 255, 117 / 255)
const NAVY_DEEP = rgb(7 / 255, 31 / 255, 74 / 255)
const GREEN = rgb(122 / 255, 194 / 255, 30 / 255)
const GREEN_TEXT = rgb(63 / 255, 107 / 255, 12 / 255)
const GREEN_SOFT = rgb(240 / 255, 248 / 255, 229 / 255)
const SLATE = rgb(100 / 255, 116 / 255, 139 / 255)
const BORDER = rgb(226 / 255, 232 / 255, 240 / 255)
const WHITE = rgb(1, 1, 1)

const PAGE_WIDTH = 595.28 // A4
const PAGE_HEIGHT = 841.89
const MARGIN = 48
const LABEL_WIDTH = 150
const VALUE_X = MARGIN + LABEL_WIDTH
const VALUE_WIDTH = PAGE_WIDTH - MARGIN - VALUE_X
const ROW_SIZE = 11
const ROW_LINE_HEIGHT = 15

interface Fonts {
  regular: PDFFont
  bold: PDFFont
}

interface ReceiptRow {
  label: string
  value: string
  bold?: boolean
}

/**
 * Helvetica (fonte padrão do PDF) só cobre o WinAnsi: espaços especiais viram espaço comum e caracteres fora do
 * conjunto (ex.: emoji num nome) viram "?", em vez de derrubar a geração.
 */
function toPdfText(text: string, font: PDFFont): string {
  const supported = new Set(font.getCharacterSet())
  return Array.from(text.normalize("NFC").replace(/[   ]/g, " "))
    .map((char) => (supported.has(char.codePointAt(0) ?? 0) ? char : "?"))
    .join("")
}

/** Quebra o texto em linhas que cabem em `maxWidth`. */
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  let current = ""
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : [""]
}

function drawHeader(page: PDFPage, fonts: Fonts): void {
  const height = 96
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - height, width: PAGE_WIDTH, height, color: NAVY_DEEP })
  // Pico/chevron verde: o motivo gráfico da marca.
  page.drawSvgPath("M 0 22 L 22 0 L 44 22", {
    x: MARGIN,
    y: PAGE_HEIGHT - 30,
    borderColor: GREEN,
    borderWidth: 6,
  })
  page.drawText("VERTEX", { x: MARGIN + 58, y: PAGE_HEIGHT - 52, size: 26, font: fonts.bold, color: WHITE })
  page.drawText("GRUPO DE CORRIDA", { x: MARGIN + 60, y: PAGE_HEIGHT - 70, size: 9, font: fonts.bold, color: GREEN })
}

function drawSectionTitle(page: PDFPage, fonts: Fonts, title: string, y: number): number {
  page.drawText(toPdfText(title.toUpperCase(), fonts.bold), { x: MARGIN, y, size: 10, font: fonts.bold, color: GREEN_TEXT })
  page.drawLine({
    start: { x: MARGIN, y: y - 6 },
    end: { x: PAGE_WIDTH - MARGIN, y: y - 6 },
    thickness: 1,
    color: BORDER,
  })
  return y - 24
}

function drawRows(page: PDFPage, fonts: Fonts, rows: ReceiptRow[], startY: number): number {
  let y = startY
  for (const row of rows) {
    const valueFont = row.bold ? fonts.bold : fonts.regular
    page.drawText(toPdfText(row.label, fonts.regular), { x: MARGIN, y, size: ROW_SIZE, font: fonts.regular, color: SLATE })
    const lines = wrapText(toPdfText(row.value, valueFont), valueFont, ROW_SIZE, VALUE_WIDTH)
    lines.forEach((line, index) => {
      page.drawText(line, { x: VALUE_X, y: y - index * ROW_LINE_HEIGHT, size: ROW_SIZE, font: valueFont, color: NAVY_DEEP })
    })
    y -= lines.length * ROW_LINE_HEIGHT + 6
  }
  return y - 14
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function getReceiptNotice(status: RegistrationReceipt["status"]): string {
  switch (status) {
    case REGISTRATION_STATUS.CONFIRMED:
      return "Inscrição confirmada. Apresente este comprovante e um documento com foto na retirada do kit."
    case REGISTRATION_STATUS.PENDING:
      return "Pagamento pendente: a vaga só é garantida após a confirmação do pagamento."
    default:
      return "Esta inscrição não está ativa. Em caso de dúvida, fale com a organização do Vertex."
  }
}

/** Gera o comprovante de inscrição em PDF (A4, uma página). */
export async function buildRegistrationReceiptPdf(receipt: RegistrationReceipt, issuedAt = new Date()): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`Comprovante de inscrição ${receipt.codigo}`)
  pdf.setAuthor("Vertex Grupo de Corrida")
  pdf.setCreationDate(issuedAt)
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  }

  drawHeader(page, fonts)

  let y = PAGE_HEIGHT - 140
  page.drawText(toPdfText("Comprovante de inscrição", fonts.bold), { x: MARGIN, y, size: 22, font: fonts.bold, color: NAVY })
  y -= 22

  // Caixa do código + status.
  const boxHeight = 64
  y -= boxHeight
  page.drawRectangle({ x: MARGIN, y, width: PAGE_WIDTH - 2 * MARGIN, height: boxHeight, color: GREEN_SOFT, borderColor: GREEN, borderWidth: 1 })
  page.drawText(toPdfText("CÓDIGO DA INSCRIÇÃO", fonts.bold), { x: MARGIN + 16, y: y + 42, size: 9, font: fonts.bold, color: GREEN_TEXT })
  page.drawText(toPdfText(receipt.codigo, fonts.bold), { x: MARGIN + 16, y: y + 16, size: 20, font: fonts.bold, color: NAVY_DEEP })
  const status = toPdfText(getRegistrationStatusLabel(receipt.status).toUpperCase(), fonts.bold)
  const statusWidth = fonts.bold.widthOfTextAtSize(status, 11)
  page.drawText(status, { x: PAGE_WIDTH - MARGIN - 16 - statusWidth, y: y + 26, size: 11, font: fonts.bold, color: NAVY })
  y -= 36

  y = drawSectionTitle(page, fonts, "Atleta", y)
  y = drawRows(
    page,
    fonts,
    [
      { label: "Nome", value: receipt.nomeCompleto },
      ...(receipt.cpfMascarado ? [{ label: "CPF", value: receipt.cpfMascarado }] : []),
    ],
    y,
  )

  y = drawSectionTitle(page, fonts, "Prova", y)
  y = drawRows(
    page,
    fonts,
    [
      { label: "Corrida", value: receipt.evento.nome, bold: true },
      { label: "Data", value: capitalize(formatApiDateLong(receipt.evento.dataEvento)) },
      { label: "Largada", value: receipt.evento.horarioLargada },
      { label: "Local", value: receipt.evento.localizacaoResumo },
      { label: "Distância", value: receipt.distancia },
      { label: "Kit", value: receipt.kit ?? "Sem kit" },
      ...(receipt.tamanhoCamisa ? [{ label: "Tamanho da camisa", value: receipt.tamanhoCamisa }] : []),
    ],
    y,
  )

  y = drawSectionTitle(page, fonts, "Valores", y)
  y = drawRows(
    page,
    fonts,
    [
      { label: "Valor base", value: formatCurrency(receipt.valorBaseCentavos) },
      ...(receipt.valorDescontoCentavos > 0
        ? [{ label: "Desconto", value: `- ${formatCurrency(receipt.valorDescontoCentavos)}` }]
        : []),
      { label: "Total", value: formatCurrency(receipt.valorTotalCentavos), bold: true },
      { label: "Inscrito em", value: formatDateTime(receipt.inscritoEm) },
    ],
    y,
  )

  const notice = wrapText(toPdfText(getReceiptNotice(receipt.status), fonts.bold), fonts.bold, 11, PAGE_WIDTH - 2 * MARGIN - 32)
  const noticeHeight = notice.length * ROW_LINE_HEIGHT + 24
  y -= noticeHeight - 10
  page.drawRectangle({ x: MARGIN, y, width: PAGE_WIDTH - 2 * MARGIN, height: noticeHeight, color: NAVY_DEEP })
  notice.forEach((line, index) => {
    page.drawText(line, { x: MARGIN + 16, y: y + noticeHeight - 22 - index * ROW_LINE_HEIGHT, size: 11, font: fonts.bold, color: WHITE })
  })

  const footer = toPdfText(
    `Emitido em ${formatDateTime(issuedAt)} (horário de Fortaleza) · Vertex Grupo de Corrida`,
    fonts.regular,
  )
  page.drawText(footer, { x: MARGIN, y: MARGIN - 8, size: 9, font: fonts.regular, color: SLATE })

  return pdf.save()
}

/** Nome do arquivo baixado: `comprovante-VX-2026-00000042.pdf`. */
export function getReceiptFileName(codigo: string): string {
  return `comprovante-${codigo}.pdf`
}
