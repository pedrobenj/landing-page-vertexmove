"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Controller, type Resolver, useForm } from "react-hook-form"
import { toast } from "sonner"

import { createOrderAction } from "@/app/actions/store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatCpfInput, formatPhoneInput } from "@/lib/utils"
import {
  checkoutFormSchema,
  type CheckoutFormData,
  type CheckoutFormValues,
} from "@/lib/validations/checkout.schema"
import { useCartStore } from "@/stores/cart-store"

// O schema exige `acceptPrivacy: true`, mas o formulário começa com o checkbox desmarcado (`false`).
const checkoutResolver = zodResolver(checkoutFormSchema) as Resolver<CheckoutFormValues, unknown, CheckoutFormData>

export function CheckoutForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const items = useCartStore((state) => state.items)
  const clear = useCartStore((state) => state.clear)
  const applyIssues = useCartStore((state) => state.applyIssues)

  const form = useForm<CheckoutFormValues, unknown, CheckoutFormData>({
    resolver: checkoutResolver,
    defaultValues: { name: "", cpf: "", whatsapp: "", email: "", acceptPrivacy: false },
  })

  function onSubmit(values: CheckoutFormData) {
    startTransition(async () => {
      const response = await createOrderAction({ ...values, items })

      if (response.status === 201 && response.data?.code) {
        clear()
        router.push(`/pedido/${response.data.code}`)
        return
      }
      if (response.status === 409 && response.data?.issues) {
        applyIssues(response.data.issues)
        toast.error(response.title ?? "Seu carrinho mudou")
        router.push("/loja/carrinho")
        return
      }
      toast.error(response.title ?? "Não foi possível finalizar a compra")
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-label="Dados do comprador">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-name">Nome completo</FieldLabel>
              <Input {...field} id="buyer-name" autoComplete="name" aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="cpf"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-cpf">CPF</FieldLabel>
              <Input
                {...field}
                id="buyer-cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                aria-invalid={fieldState.invalid}
                onChange={(event) => field.onChange(formatCpfInput(event.target.value))}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="whatsapp"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-whatsapp">WhatsApp</FieldLabel>
              <Input
                {...field}
                id="buyer-whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(85) 90000-0000"
                aria-invalid={fieldState.invalid}
                onChange={(event) => field.onChange(formatPhoneInput(event.target.value))}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-email">E-mail</FieldLabel>
              <Input {...field} id="buyer-email" type="email" autoComplete="email" aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="acceptPrivacy"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} orientation="horizontal">
              <Checkbox
                id="buyer-privacy"
                ref={field.ref}
                name={field.name}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel htmlFor="buyer-privacy" className="font-normal">
                  <span>
                    Li e aceito a{" "}
                    <Link href="/privacidade" target="_blank" className="underline">
                      política de privacidade
                    </Link>
                  </span>
                </FieldLabel>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
        <Button type="submit" variant="cta" size="xl" disabled={isPending || items.length === 0}>
          {isPending ? "Criando pedido..." : "Ir para o pagamento"}
        </Button>
      </FieldGroup>
    </form>
  )
}
