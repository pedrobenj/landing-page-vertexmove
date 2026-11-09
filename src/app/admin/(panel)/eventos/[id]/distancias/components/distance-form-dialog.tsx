"use client"

import { Pencil, Plus } from "lucide-react"

import { FormDialog } from "@/components/admin"
import type { DistanceFormInput } from "@/lib/validations/distance.schema"

import { DistanceForm } from "./distance-form"

interface DistanceFormDialogProps {
  eventId: number
  /** Com distância: edição; sem: "Nova distância". */
  distance?: { id: number; nome: string }
  defaultValues: DistanceFormInput
}

export function DistanceFormDialog({ eventId, distance, defaultValues }: DistanceFormDialogProps) {
  return (
    <FormDialog
      title={distance ? `Editar ${distance.nome}` : "Nova distância"}
      variant={distance ? "outline" : "default"}
      size={distance ? "sm" : "default"}
      triggerAriaLabel={distance ? `Editar distância ${distance.nome}` : undefined}
      triggerLabel={
        distance ? (
          <>
            <Pencil aria-hidden="true" /> Editar
          </>
        ) : (
          <>
            <Plus aria-hidden="true" /> Nova distância
          </>
        )
      }
    >
      {({ close, setBusy }) => <DistanceForm eventId={eventId} distanceId={distance?.id} defaultValues={defaultValues} onSaved={close} onBusyChange={setBusy} />}
    </FormDialog>
  )
}
