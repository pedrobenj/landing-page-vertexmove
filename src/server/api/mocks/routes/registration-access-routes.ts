import "server-only"

import { randomBytes, randomUUID } from "node:crypto"

import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { RegistrationAccessGrant } from "@/types/api/registration-access.interface"

import { getMockDb } from "../mock-db"
import { apiError, json, type MockRoute } from "../mock-http"
import { isActiveRegistrationStatus } from "../mock-mappers"
import { accessRedeemSchema, lookupSchema, validate } from "../mock-schemas"
import { toFortalezaIso } from "../mock-time"

/** Validade do link mágico (plan/06, opção A). */
const ACCESS_LINK_TTL_MS = 30 * 60 * 1000
/** Reserva da vaga enquanto a inscrição está pendente (mesmo prazo de `registration-routes.ts`). */
const REGISTRATION_HOLD_MS = 30 * 60 * 1000

/** Mesmo 404 para token inexistente, vencido ou já usado: não revela qual falhou. */
const invalidLink = () => apiError(404, API_ERROR_CODE.NOT_FOUND, "Link de acesso inválido ou expirado.")

export const registrationAccessRoutes: MockRoute[] = [
  {
    // Pede o link: resposta sempre 202 sem corpo, exista ou não inscrição (não revela cadastro).
    method: "POST",
    path: "/inscricoes/acesso/link",
    handler: ({ body }) => {
      const input = validate(lookupSchema, body)
      if (input instanceof Response) {
        return apiError(422, API_ERROR_CODE.INVALID_DATA, "Informe exatamente um entre CPF e WhatsApp.")
      }

      const db = getMockDb()
      const now = Date.now()
      const matches = db.registrations.filter(
        (item) =>
          item.email &&
          isActiveRegistrationStatus(item.status) &&
          ("cpf" in input ? item.cpf === input.cpf : item.whatsapp === input.whatsapp),
      )
      for (const registration of matches) {
        const token = randomBytes(32).toString("base64url")
        db.accessLinks.push({ token, codigo: registration.codigo, expiraEm: now + ACCESS_LINK_TTL_MS, usadoEm: null })
        db.outbox.unshift({
          para: registration.email ?? "",
          codigo: registration.codigo,
          link: `/inscricao/acesso?t=${token}`,
          enviadoEm: toFortalezaIso(new Date(now)),
        })
      }
      return new Response(null, { status: 202 })
    },
  },
  {
    // Troca o token (uso único, 30 min) por um accessToken novo: o anterior deixa de valer.
    method: "POST",
    path: "/inscricoes/acesso",
    handler: ({ body }) => {
      const input = validate(accessRedeemSchema, body)
      if (input instanceof Response) return input

      const db = getMockDb()
      const link = db.accessLinks.find((item) => item.token === input.token)
      if (!link || link.usadoEm !== null || link.expiraEm <= Date.now()) return invalidLink()
      const registration = db.registrations.find((item) => item.codigo === link.codigo)
      if (!registration) return invalidLink()

      link.usadoEm = Date.now()
      registration.accessToken = randomUUID()
      const grant: RegistrationAccessGrant = {
        codigo: registration.codigo,
        accessToken: registration.accessToken,
        expiraEm: new Date(Date.parse(registration.inscritoEm) + REGISTRATION_HOLD_MS).toISOString(),
      }
      return json(200, grant)
    },
  },
  {
    // Só no mock: a "caixa de entrada" dos e-mails com o link (a página `/dev/emails` lê daqui).
    method: "GET",
    path: "/dev/emails",
    handler: () => json(200, getMockDb().outbox),
  },
]
