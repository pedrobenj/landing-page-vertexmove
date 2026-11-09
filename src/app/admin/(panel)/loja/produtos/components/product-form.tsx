"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"

import { saveProductAction } from "@/app/actions/admin-products"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PRODUCT_TYPE, PRODUCT_TYPE_LABEL } from "@/enums/product-type.enum"
import { slugify } from "@/lib/utils"
import { productFormSchema, type ProductFormData, type ProductFormInput } from "@/lib/validations/product.schema"

import { VariantFieldRow } from "./variant-field-row"

interface ProductFormProps {
  defaultValues: ProductFormInput
  productId?: string
}

const PRODUCT_TYPES = Object.values(PRODUCT_TYPE)

export function ProductForm({ defaultValues, productId }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isRedirecting, setIsRedirecting] = useState(false)
  // Trava síncrona contra duplo envio (o estado do React só atualiza no próximo render).
  const submittingRef = useRef(false)

  const form = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })
  const variants = useFieldArray({ control: form.control, name: "variants" })
  const variantsError = form.formState.errors.variants

  function onSubmit() {
    if (submittingRef.current) return
    submittingRef.current = true

    startTransition(async () => {
      let response: Awaited<ReturnType<typeof saveProductAction>>
      try {
        // Envia os valores crus do formulário (com id e originalStock dos tamanhos salvos):
        // o servidor valida e converte de novo.
        response = await saveProductAction(form.getValues(), productId)
      } catch {
        submittingRef.current = false
        toast.error("Não foi possível salvar o produto. Verifique sua conexão e tente de novo.")
        return
      }

      if (response.error) {
        submittingRef.current = false
        toast.error(response.title ?? "Não foi possível salvar o produto")
        return
      }

      setIsRedirecting(true)
      toast.success(response.title ?? "Produto salvo")
      router.push("/admin/loja/produtos")
    })
  }

  const isBusy = form.formState.isSubmitting || isPending || isRedirecting

  return (
    <form
      onSubmit={(event) => form.handleSubmit(onSubmit)(event)}
      noValidate
      className="flex max-w-2xl flex-col gap-8"
      aria-label="Produto"
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-name">Nome</FieldLabel>
              <Input
                {...field}
                id="product-name"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "product-name-error" : undefined}
                onBlur={() => {
                  field.onBlur()
                  if (!form.getValues("slug")) form.setValue("slug", slugify(field.value), { shouldValidate: true })
                }}
              />
              <FieldError id="product-name-error" errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-slug">Endereço (slug)</FieldLabel>
              <Input
                {...field}
                id="product-slug"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "product-slug-error" : undefined}
              />
              <FieldError id="product-slug-error" errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-type">Tipo</FieldLabel>
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  ref={field.ref}
                  id="product-type"
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={fieldState.invalid ? "product-type-error" : undefined}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {PRODUCT_TYPE_LABEL[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="product-type-error" errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="price"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-price">Preço (R$)</FieldLabel>
              <Input
                {...field}
                id="product-price"
                inputMode="decimal"
                placeholder="89,90"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "product-price-error" : undefined}
              />
              <FieldError id="product-price-error" errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-description">Descrição</FieldLabel>
              <Textarea
                {...field}
                id="product-description"
                rows={4}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "product-description-error" : undefined}
              />
              <FieldError id="product-description-error" errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="pickupInfo"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-pickup">Local e horário de retirada</FieldLabel>
              <Textarea
                {...field}
                id="product-pickup"
                rows={2}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "product-pickup-error" : undefined}
              />
              <FieldError id="product-pickup-error" errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldSet>
        <FieldLegend>Tamanhos e estoque</FieldLegend>
        <ul className="flex flex-col gap-3">
          {variants.fields.map((variant, index) => (
            <VariantFieldRow
              key={variant.id}
              control={form.control}
              index={index}
              // Só tamanhos novos (sem id salvo) podem ser removidos; os salvos vêm primeiro e não mudam de posição.
              canRemove={!defaultValues.variants[index]?.id && variants.fields.length > 1}
              onRemove={() => variants.remove(index)}
            />
          ))}
        </ul>
        <FieldError errors={[variantsError?.root, variantsError]} />
        <Button type="button" variant="outline" className="w-fit" onClick={() => variants.append({ label: "", stock: "0" })}>
          <Plus /> Adicionar tamanho
        </Button>
      </FieldSet>

      <FieldGroup>
        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                ref={field.ref}
                id="product-active"
                name={field.name}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
              />
              <FieldLabel htmlFor="product-active" className="font-normal">
                Ativo (visível na loja)
              </FieldLabel>
            </Field>
          )}
        />
        <Controller
          name="isFeatured"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                ref={field.ref}
                id="product-featured"
                name={field.name}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
              />
              <FieldLabel htmlFor="product-featured" className="font-normal">
                Destaque na home
              </FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>

      <Button type="submit" size="xl" disabled={isBusy} className="w-fit">
        {isBusy ? "Salvando..." : "Salvar produto"}
      </Button>
    </form>
  )
}
