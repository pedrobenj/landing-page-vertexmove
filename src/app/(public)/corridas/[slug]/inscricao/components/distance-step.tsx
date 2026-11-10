"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo } from "react"
import { Controller, type Resolver, useForm, useWatch } from "react-hook-form"

import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field"
import { RadioGroup } from "@/components/ui/radio-group"
import {
  createDistanceStepSchema,
  type DistanceStepData,
  type DistanceStepValues,
} from "@/lib/validations/registration.schema"
import type { PublicEventDetail } from "@/types/api/public-event-detail.interface"

import { DistanceOption } from "./distance-option"
import { KitOption } from "./kit-option"
import { ShirtSizeOption } from "./shirt-size-option"
import { StepActions } from "./step-actions"
import { StepHeading } from "./step-heading"

interface DistanceStepProps {
  event: PublicEventDetail
  defaultValues: DistanceStepData | null
  onSubmit: (data: DistanceStepData) => void
}

const NO_KIT = "none"
const legendClassName = "font-heading text-lg font-black text-brand-navy-deep"

/** Etapa 1: distância (esgotadas desabilitadas), kit ou "Sem kit" e tamanho da camisa (se houver kit). */
export function DistanceStep({ event, defaultValues, onSubmit }: DistanceStepProps) {
  const distances = event.distancias ?? []
  const kits = event.kits ?? []
  const sizes = event.tamanhosCamisa ?? []
  // O schema exige `distanciaId`, mas o formulário começa sem nada escolhido (`null`).
  const resolver = useMemo(
    () => zodResolver(createDistanceStepSchema(event)) as Resolver<DistanceStepValues, unknown, DistanceStepData>,
    [event],
  )

  const form = useForm<DistanceStepValues, unknown, DistanceStepData>({
    resolver,
    // Com kits, o primeiro já vem marcado (o kit faz parte da inscrição); "Sem kit" fica a um clique.
    defaultValues: defaultValues ?? { distanciaId: null, kitId: kits[0]?.id ?? null, tamanhoCamisaId: null },
  })
  const kitId = useWatch({ control: form.control, name: "kitId" })
  const showSizes = kits.length > 0 && kitId !== null && sizes.length > 0
  // O RHF foca o `field.ref` no erro: vai no primeiro rádio habilitado (o RadioGroup em si não é focável).
  const firstAvailableDistanceId = distances.find((distance) => !distance.esgotado && distance.loteVigente !== null)?.id

  return (
    <form onSubmit={(formEvent) => form.handleSubmit(onSubmit)(formEvent)} noValidate className="flex flex-col gap-8">
      <StepHeading title="Distância e kit" description="Escolha a distância que você vai correr e o seu kit." />

      <Controller
        name="distanciaId"
        control={form.control}
        render={({ field, fieldState }) => (
          <FieldSet data-invalid={fieldState.invalid}>
            <FieldLegend id="distance-legend" className={legendClassName}>
              Distância
            </FieldLegend>
            <RadioGroup
              name={field.name}
              value={field.value === null ? "" : String(field.value)}
              onValueChange={(value) => field.onChange(Number(value))}
              aria-labelledby="distance-legend"
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? "distance-error" : undefined}
              className="grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {distances.map((distance) => (
                <DistanceOption
                  key={distance.id}
                  distance={distance}
                  eventStartTime={event.horarioLargada}
                  inputRef={distance.id === firstAvailableDistanceId ? field.ref : undefined}
                />
              ))}
            </RadioGroup>
            <FieldError id="distance-error" errors={[fieldState.error]} />
          </FieldSet>
        )}
      />

      {kits.length > 0 && (
        <Controller
          name="kitId"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend id="kit-legend" className={legendClassName}>
                Kit
              </FieldLegend>
              <RadioGroup
                name={field.name}
                value={field.value === null ? NO_KIT : String(field.value)}
                onValueChange={(value) => field.onChange(value === NO_KIT ? null : Number(value))}
                aria-labelledby="kit-legend"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "kit-error" : undefined}
                className="grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {kits.map((kit, index) => (
                  <KitOption
                    key={kit.id}
                    value={String(kit.id)}
                    name={kit.nome}
                    description={kit.descricao}
                    priceCents={kit.precoCentavos}
                    inputRef={index === 0 ? field.ref : undefined}
                  />
                ))}
                <KitOption value={NO_KIT} name="Sem kit" description="Só a participação na prova." />
              </RadioGroup>
              <FieldError id="kit-error" errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
      )}

      {showSizes && (
        <Controller
          name="tamanhoCamisaId"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend id="shirt-size-legend" className={legendClassName}>
                Tamanho da camisa
              </FieldLegend>
              <RadioGroup
                name={field.name}
                value={field.value === null ? "" : String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
                aria-labelledby="shirt-size-legend"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? "shirt-size-error" : undefined}
                className="flex flex-wrap gap-2"
              >
                {sizes.map((size, index) => (
                  <ShirtSizeOption key={size.id} size={size} inputRef={index === 0 ? field.ref : undefined} />
                ))}
              </RadioGroup>
              <FieldError id="shirt-size-error" errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
      )}

      <StepActions />
    </form>
  )
}
