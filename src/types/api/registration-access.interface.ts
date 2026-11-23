import type { RegistrationLookupInput } from "./registration.interface"

/** Pedido do link de acesso: a mesma entrada da consulta (exatamente um de `cpf`/`whatsapp`). */
export type RegistrationAccessLinkInput = RegistrationLookupInput

/** `POST /inscricoes/acesso` — troca o token de uso único do link. */
export interface RegistrationAccessRedeemInput {
  token: string
}

/** Resposta da troca: o `accessToken` reemitido (o anterior deixa de valer). Fica só no cookie HttpOnly. */
export interface RegistrationAccessGrant {
  codigo: string
  accessToken: string
  expiraEm: string
}

/** E-mail "enviado" pelo mock (`GET /dev/emails`): faz o papel da caixa de entrada no modo mock. */
export interface MockAccessEmail {
  para: string
  codigo: string
  /** Caminho relativo ao site: `/inscricao/acesso?t=<token>`. */
  link: string
  enviadoEm: string
}
