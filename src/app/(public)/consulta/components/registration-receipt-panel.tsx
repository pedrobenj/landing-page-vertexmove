"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ArrowRight, Download } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getRegistrationReceiptAction, downloadRegistrationReceiptAction } from "@/app/actions/registrations"
import { MaskedTextField } from "@/app/(public)/corridas/[slug]/inscricao/components/masked-text-field"
import { Button } from "@/components/ui/button"
import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { downloadBase64File, formatDateInput } from "@/lib/utils"
import { receiptVerificationSchema, type ReceiptVerificationInput } from "@/lib/validations/receipt.schema"
import type { RegistrationReceipt } from "@/types/api/registration-receipt.interface"

import { RegistrationReceiptDetails } from "./registration-receipt-details"

interface RegistrationReceiptPanelProps {
  referencia: string
  /** Avisa o diálogo que há envio em andamento (não fecha no meio). */
  onBusyChange: (busy: boolean) => void
}

const NETWORK_ERROR = "Verifique sua conexão e tente de novo."

/**
 * Passo 1: o atleta confirma a data de nascimento. Passo 2: vê os dados e baixa o comprovante em PDF.
 * O nascimento fica só no estado deste painel (nunca em URL ou storage) e some ao fechar o diálogo.
 */
export function RegistrationReceiptPanel({ referencia, onBusyChange }: RegistrationReceiptPanelProps) {
  const [receipt, setReceipt] = useState<RegistrationReceipt | null>(null)
  const [birthDate, setBirthDate] = useState("")
  const form = useForm<ReceiptVerificationInput>({
    resolver: zodResolver(receiptVerificationSchema),
    defaultValues: { dataNascimento: "" },
  })

  const verify = useMutation({
    mutationFn: getRegistrationReceiptAction,
    gcTime: 0,
    onSuccess: (response, variables) => {
      if (response.status === 200 && response.data) {
        setReceipt(response.data)
        setBirthDate(variables.dataNascimento)
        return
      }
      form.setError("dataNascimento", { type: "server", message: response.error ?? NETWORK_ERROR }, { shouldFocus: true })
    },
    onError: () => toast.error("Não foi possível abrir a inscrição", { description: NETWORK_ERROR }),
  })

  const download = useMutation({
    mutationFn: downloadRegistrationReceiptAction,
    gcTime: 0,
    onSuccess: (response) => {
      if (response.status === 200 && response.data) {
        downloadBase64File(response.data.base64, response.data.fileName, "application/pdf")
        toast.success("Comprovante baixado")
        return
      }
      toast.error(response.title ?? "Não foi possível gerar o comprovante", { description: response.error })
    },
    onError: () => toast.error("Não foi possível gerar o comprovante", { description: NETWORK_ERROR }),
  })

  const isBusy = verify.isPending || download.isPending
  useEffect(() => onBusyChange(isBusy), [isBusy, onBusyChange])

  if (receipt) {
    return (
      <div className="flex flex-col gap-6">
        <RegistrationReceiptDetails receipt={receipt} />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {receipt.status === REGISTRATION_STATUS.PENDING && (
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href={`/inscricao/${receipt.codigo}`}>
                Ir para o pagamento
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="cta"
            size="lg"
            className="w-full sm:w-auto"
            disabled={download.isPending}
            onClick={() => download.mutate({ referencia, dataNascimento: birthDate })}
          >
            <Download aria-hidden="true" />
            {download.isPending ? "Gerando PDF..." : "Baixar comprovante (PDF)"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      noValidate
      aria-label="Confirmar data de nascimento"
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => verify.mutate({ referencia, dataNascimento: values.dataNascimento }))}
    >
      <MaskedTextField
        control={form.control}
        name="dataNascimento"
        id={`receipt-birth-date-${referencia}`}
        label="Data de nascimento do atleta"
        placeholder="DD/MM/AAAA"
        inputMode="numeric"
        autoComplete="bday"
        format={formatDateInput}
      />
      <Button type="submit" variant="cta" size="lg" className="w-full sm:w-fit" disabled={verify.isPending}>
        {verify.isPending ? "Verificando..." : "Ver inscrição"}
      </Button>
    </form>
  )
}
