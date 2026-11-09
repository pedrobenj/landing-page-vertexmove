"use client"

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import type { Control } from "react-hook-form"

import { FormTextField } from "@/components/admin"
import { Button } from "@/components/ui/button"
import type { KitFormData, KitFormInput } from "@/lib/validations/kit.schema"

interface KitPhotoFieldRowProps {
  control: Control<KitFormInput, unknown, KitFormData>
  index: number
  total: number
  idPrefix: string
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}

/** Uma foto do kit: URL e texto alternativo. A posição na lista é a ordem de exibição. */
export function KitPhotoFieldRow({ control, index, total, idPrefix, onMoveUp, onMoveDown, onRemove }: KitPhotoFieldRowProps) {
  const position = index + 1
  const isFirst = index === 0
  const isLast = index === total - 1
  // `aria-disabled` + no-op em vez de `disabled`: ao levar a foto ao topo/fim o botão focado continua
  // focável (com `disabled` o foco cairia no body).
  return (
    <li className="flex flex-col gap-3 rounded-xl border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Foto {position}</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={isFirst ? undefined : onMoveUp}
            aria-disabled={isFirst}
            className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            aria-label={`Subir foto ${position}`}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={isLast ? undefined : onMoveDown}
            aria-disabled={isLast}
            className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            aria-label={`Descer foto ${position}`}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} aria-label={`Remover foto ${position}`}>
            <Trash2 aria-hidden="true" /> Remover
          </Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>
    </li>
  )
}
