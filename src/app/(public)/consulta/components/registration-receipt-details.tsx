import { cn, formatApiDate, formatCurrency, formatDateTime, getRegistrationStatusBadgeClass, getRegistrationStatusLabel } from "@/lib/utils"
import type { RegistrationReceipt } from "@/types/api/registration-receipt.interface"

import { ReceiptRow } from "./receipt-row"

interface RegistrationReceiptDetailsProps {
  receipt: RegistrationReceipt
}

/** Dados da inscrição liberados pela data de nascimento (CPF mascarado). */
export function RegistrationReceiptDetails({ receipt }: RegistrationReceiptDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-green/40 bg-brand-green/10 p-4">
        <p className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-brand-green-text uppercase">Código da inscrição</span>
          <span data-testid="receipt-code" className="font-heading text-xl font-black text-brand-navy-deep">
            {receipt.codigo}
          </span>
        </p>
        <span className={cn("w-fit rounded-full px-3 py-1 text-sm font-bold", getRegistrationStatusBadgeClass(receipt.status))}>
          {getRegistrationStatusLabel(receipt.status)}
        </span>
      </div>

      <dl className="divide-y">
        <ReceiptRow label="Atleta">{receipt.nomeCompleto}</ReceiptRow>
        {receipt.cpfMascarado && <ReceiptRow label="CPF">{receipt.cpfMascarado}</ReceiptRow>}
        <ReceiptRow label="Corrida">{receipt.evento.nome}</ReceiptRow>
        <ReceiptRow label="Data e largada">
          {formatApiDate(receipt.evento.dataEvento)} às {receipt.evento.horarioLargada}
        </ReceiptRow>
        <ReceiptRow label="Local">{receipt.evento.localizacaoResumo}</ReceiptRow>
        <ReceiptRow label="Distância">{receipt.distancia}</ReceiptRow>
        <ReceiptRow label="Kit">{receipt.kit ?? "Sem kit"}</ReceiptRow>
        {receipt.tamanhoCamisa && <ReceiptRow label="Tamanho da camisa">{receipt.tamanhoCamisa}</ReceiptRow>}
        {receipt.valorDescontoCentavos > 0 && (
          <ReceiptRow label="Desconto">- {formatCurrency(receipt.valorDescontoCentavos)}</ReceiptRow>
        )}
        <ReceiptRow label="Total">{formatCurrency(receipt.valorTotalCentavos)}</ReceiptRow>
        <ReceiptRow label="Inscrito em">{formatDateTime(receipt.inscritoEm)}</ReceiptRow>
      </dl>
    </div>
  )
}
