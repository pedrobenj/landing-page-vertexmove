"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef, useState, useTransition } from "react"
import { Controller, type Resolver, useForm } from "react-hook-form"
import { toast } from "sonner"

import { createOrderAction } from "@/app/actions/store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatCpfInput, formatPhoneInput, markLastOrder } from "@/lib/utils"
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
  const [isRedirecting, setIsRedirecting] = useState(false)
  // Trava síncrona contra duplo envio (o estado do React só atualiza no próximo render).
  const submittingRef = useRef(false)
  const items = useCartStore((state) => state.items)
  const applyIssues = useCartStore((state) => state.applyIssues)

  const form = useForm<CheckoutFormValues, unknown, CheckoutFormData>({
    resolver: checkoutResolver,
    defaultValues: { name: "", cpf: "", whatsapp: "", email: "", acceptPrivacy: false },
  })

  function onSubmit(values: CheckoutFormData) {
    if (submittingRef.current) return
    submittingRef.current = true

    startTransition(async () => {
      let response: Awaited<ReturnType<typeof createOrderAction>>
      try {
        response = await createOrderAction({ ...values, items })
      } catch {
        submittingRef.current = false
        toast.error("Não foi possível finalizar a compra. Verifique sua conexão e tente de novo.")
        return
      }

      if (response.status === 201 && response.data?.code) {
        // Carrinho esvaziado e "Pedido criado!" na página do pedido (FinishCheckoutOnMount), depois da
        // navegação: um toast aqui expirava enquanto a página do pedido (bloqueante) ainda carregava.
        setIsRedirecting(true)
        markLastOrder(response.data.code)
        router.push(`/pedido/${response.data.code}`)
        return
      }

      submittingRef.current = false
      if (response.status === 409 && response.data?.issues) {
        applyIssues(response.data.issues)
        toast.error(response.title ?? "Seu carrinho mudou", { description: response.error })
        router.push("/loja/carrinho")
        return
      }
      toast.error(response.title ?? "Não foi possível finalizar a compra", { description: response.error })
    })
  }

  const isBusy = form.formState.isSubmitting || isPending || isRedirecting

  return (
    <form
      onSubmit={(event) => form.handleSubmit(onSubmit)(event)}
      noValidate
      aria-label="Dados do comprador"
      className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-name">Nome completo</FieldLabel>
              <Input {...field} id="buyer-name" aria-describedby={fieldState.invalid ? "buyer-name-error" : undefined} autoComplete="name" aria-invalid={fieldState.invalid} />
              <FieldError id="buyer-name-error" errors={[fieldState.error]} />
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
                aria-describedby={fieldState.invalid ? "buyer-cpf-error" : undefined}
                inputMode="numeric"
                placeholder="000.000.000-00"
                aria-invalid={fieldState.invalid}
                onChange={(event) => field.onChange(formatCpfInput(event.target.value))}
              />
              <FieldError id="buyer-cpf-error" errors={[fieldState.error]} />
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
                aria-describedby={fieldState.invalid ? "buyer-whatsapp-error" : undefined}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(85) 90000-0000"
                aria-invalid={fieldState.invalid}
                onChange={(event) => field.onChange(formatPhoneInput(event.target.value))}
              />
              <FieldError id="buyer-whatsapp-error" errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="buyer-email">E-mail</FieldLabel>
              <Input {...field} id="buyer-email" aria-describedby={fieldState.invalid ? "buyer-email-error" : undefined} type="email" autoComplete="email" aria-invalid={fieldState.invalid} />
              <FieldError id="buyer-email-error" errors={[fieldState.error]} />
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
                aria-describedby={fieldState.invalid ? "buyer-privacy-error" : undefined}
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
                <FieldError id="buyer-privacy-error" errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
        <Button type="submit" variant="cta" size="xl" disabled={isBusy || items.length === 0}>
          {isBusy ? "Criando pedido..." : "Ir para o pagamento"}
          {!isBusy && <ArrowRight aria-hidden="true" />}
        </Button>
      </FieldGroup>
    </form>
  )
}
