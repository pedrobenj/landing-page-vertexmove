"use client"

import { Trash2 } from "lucide-react"
import type { Control } from "react-hook-form"

import { FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import type { KitFormData, KitFormInput } from "@/lib/validations/kit.schema"

interface KitPhotoFieldRowProps {
  control: Control<KitFormInput, unknown, KitFormData>
  index: number
  idPrefix: string
  onRemove: () => void
}

/** Uma foto do kit: URL, texto alternativo e ordem. */
export function KitPhotoFieldRow({ control, index, idPrefix, onRemove }: KitPhotoFieldRowProps) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Foto {index + 1}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Remover foto ${index + 1}`}>
          <Trash2 aria-hidden="true" /> Remover
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_6rem]">
        <FormTextField
          idPrefix={idPrefix}
          control={control}
          name={`fotos.${index}.url`}
          label="URL da foto"
          type="url"
          inputMode="url"
          placeholder="https://"
        />
        <FormTextField idPrefix={idPrefix} control={control} name={`fotos.${index}.alt`} label="Descrição da foto" placeholder="Camisa e medalha" />
        <FormTextField idPrefix={idPrefix} control={control} name={`fotos.${index}.ordem`} label="Ordem" inputMode="numeric" />
      </div>
    </li>
  )
}
