"use client"

import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { toast } from "sonner"

import { QuantityStepper } from "@/components/store"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import { MAX_QUANTITY_PER_ITEM } from "@/lib/utils/constants"
import { selectItemQuantity, useCartStore } from "@/stores/cart-store"
import type { StoreVariant } from "@/types/store-product.interface"

import { SizeOption } from "./size-option"

interface ProductPurchaseFormProps {
  variants: StoreVariant[]
}

export function ProductPurchaseForm({ variants }: ProductPurchaseFormProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const sizeLabelId = useId()
  const quantityLabelId = useId()
  const firstAvailable = variants.find((variant) => variant.stock > 0)
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? "")
  const [quantity, setQuantity] = useState(1)

  const selected = variants.find((variant) => variant.id === variantId)
  const maxQuantity = Math.min(selected?.stock ?? 1, MAX_QUANTITY_PER_ITEM)
  const hasSizeChoice = variants.length > 1

  if (!firstAvailable) {
    return (
      <Button size="xl" disabled className="w-full sm:w-auto">
        Esgotado
      </Button>
    )
  }

  function handleAdd() {
    if (!selected) return
    const before = selectItemQuantity(useCartStore.getState(), selected.id)
    const added = addItem(selected.id, quantity)
    if (!added) {
      toast.error("Seu carrinho já tem o máximo de itens diferentes")
      return
    }
    if (selectItemQuantity(useCartStore.getState(), selected.id) < before + quantity) {
      toast.info(`Limite de ${MAX_QUANTITY_PER_ITEM} unidades por item`)
      return
    }
    toast.success("Adicionado ao carrinho", {
      action: { label: "Ver carrinho", onClick: () => router.push("/loja/carrinho") },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {hasSizeChoice && (
        <fieldset className="flex flex-col gap-2">
          <legend id={sizeLabelId} className="mb-2 text-sm font-semibold">
            Tamanho
          </legend>
          <RadioGroup
            aria-labelledby={sizeLabelId}
            value={variantId}
            onValueChange={(value) => {
              setVariantId(value)
              setQuantity(1)
            }}
            className="flex flex-wrap gap-2"
          >
            {variants.map((variant) => (
              <SizeOption key={variant.id} variant={variant} />
            ))}
          </RadioGroup>
        </fieldset>
      )}

      <div className="flex flex-col gap-2">
        <span id={quantityLabelId} className="text-sm font-semibold">
          Quantidade
        </span>
        <QuantityStepper value={quantity} max={maxQuantity} onChange={setQuantity} labelledBy={quantityLabelId} />
      </div>

      <Button variant="cta" size="xl" className="w-full sm:w-auto" onClick={handleAdd}>
        Adicionar ao carrinho
      </Button>
    </div>
  )
}
