"use client"

import { Pencil, Plus } from "lucide-react"

import { FormDialog } from "@/components/admin"
import type { PriceTierFormInput } from "@/lib/validations/price-tier.schema"

import { PriceTierForm } from "./price-tier-form"

interface PriceTierFormDialogProps {
  eventId: number
  distance: { id: number; nome: string }
  /** Com lote: edição; sem: "Novo lote". */
  priceTier?: { id: number; nome: string }
  defaultValues: PriceTierFormInput
}

export function PriceTierFormDialog({ eventId, distance, priceTier, defaultValues }: PriceTierFormDialogProps) {
  return (
    <FormDialog
      title={priceTier ? `Editar ${priceTier.nome}` : `Novo lote — ${distance.nome}`}
      size="sm"
      variant={priceTier ? "ghost" : "outline"}
      triggerAriaLabel={priceTier ? `Editar lote ${priceTier.nome} (${distance.nome})` : `Novo lote para ${distance.nome}`}
      triggerLabel={
        priceTier ? (
          <>
            <Pencil aria-hidden="true" /> Editar
          </>
        ) : (
          <>
            <Plus aria-hidden="true" /> Novo lote
          </>
        )
      }
    >
      {(close) => (
        <PriceTierForm eventId={eventId} distanceId={distance.id} priceTierId={priceTier?.id} defaultValues={defaultValues} onSaved={close} />
      )}
    </FormDialog>
  )
}
