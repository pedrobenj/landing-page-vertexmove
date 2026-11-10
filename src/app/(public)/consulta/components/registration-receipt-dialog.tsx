"use client"

import { FileText } from "lucide-react"

import { FormDialog } from "@/components/admin/form-dialog"

import { RegistrationReceiptPanel } from "./registration-receipt-panel"

interface RegistrationReceiptDialogProps {
  referencia: string
  /** Nome acessível do botão (ex.: "Ver inscrição: Corrida X — 5 km"). */
  ariaLabel: string
}

/** Botão "Ver inscrição" da consulta: Dialog no desktop, Drawer no mobile. */
export function RegistrationReceiptDialog({ referencia, ariaLabel }: RegistrationReceiptDialogProps) {
  return (
    <FormDialog
      triggerLabel={
        <>
          <FileText aria-hidden="true" />
          Ver inscrição
        </>
      }
      triggerAriaLabel={ariaLabel}
      title="Sua inscrição"
      description="Para proteger seus dados, confirme a data de nascimento do atleta."
      variant="outline"
      size="lg"
    >
      {({ setBusy }) => <RegistrationReceiptPanel referencia={referencia} onBusyChange={setBusy} />}
    </FormDialog>
  )
}
