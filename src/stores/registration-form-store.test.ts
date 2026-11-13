// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"

import { REGISTRATION_STATUS } from "@/enums/registration-status.enum"
import { REGISTRATION_STEP } from "@/enums/registration-step.enum"

import { useRegistrationFormStore } from "./registration-form-store"

const store = () => useRegistrationFormStore.getState()
const athlete = { nomeCompleto: "Maria da Silva", dataNascimento: "06/12/1990", cpf: "", whatsapp: "(85) 99999-0000", email: "" }
const confirmation = {
  codigo: "VX-2026-00000001",
  status: REGISTRATION_STATUS.PENDING,
  valorBaseCentavos: 8990,
  valorDescontoCentavos: 0,
  valorTotalCentavos: 8990,
  expiraEm: "2026-11-12T15:30:00.000Z",
  eventoSlug: "corrida",
  distanciaId: 1,
}

describe("registration form store", () => {
  beforeEach(() => {
    sessionStorage.clear()
    useRegistrationFormStore.setState({ eventSlug: null, step: REGISTRATION_STEP.DISTANCE, distance: null, athlete: null, terms: null, confirmation: null })
  })

  it("avança as etapas ao salvar cada passo", () => {
    store().start("corrida")
    store().setDistance({ distanciaId: 1, kitId: null, tamanhoCamisaId: null })
    expect(store().step).toBe(REGISTRATION_STEP.ATHLETE)
    store().setAthlete(athlete)
    expect(store().step).toBe(REGISTRATION_STEP.TERMS)
    store().setTerms({ aceitaRegulamento: true, aceitaTermo: true, aceitaPrivacidade: true })
    expect(store().step).toBe(REGISTRATION_STEP.SUMMARY)
  })

  it("retoma o mesmo evento e descarta o rascunho ao trocar de evento", () => {
    store().start("corrida")
    store().setAthlete(athlete)
    store().start("corrida")
    expect(store().athlete).toEqual(athlete)
    store().start("outra-corrida")
    expect(store().athlete).toBeNull()
    expect(store().eventSlug).toBe("outra-corrida")
  })

  it("persiste o rascunho no sessionStorage, mas não a confirmação", () => {
    store().start("corrida")
    store().setAthlete(athlete)
    store().setConfirmation(confirmation)

    const saved = JSON.parse(sessionStorage.getItem("vertex-registration-form") ?? "{}")
    expect(saved.state.athlete).toEqual(athlete)
    expect(saved.state).not.toHaveProperty("confirmation")
    expect(localStorage.length).toBe(0)
  })

  it("clearTerms desmarca os aceites e volta para a etapa de termos", () => {
    store().start("corrida")
    store().setDistance({ distanciaId: 1, kitId: null, tamanhoCamisaId: null })
    store().setAthlete(athlete)
    store().setTerms({ aceitaRegulamento: true, aceitaTermo: true, aceitaPrivacidade: true })
    store().clearTerms()
    expect(store()).toMatchObject({ terms: null, step: REGISTRATION_STEP.TERMS, athlete })
  })

  it("reset limpa o rascunho e mantém a confirmação", () => {
    store().start("corrida")
    store().setAthlete(athlete)
    store().setConfirmation(confirmation)
    store().reset()
    expect(store()).toMatchObject({ eventSlug: null, athlete: null, step: REGISTRATION_STEP.DISTANCE, confirmation })
  })
})
