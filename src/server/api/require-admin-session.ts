import "server-only"

import { redirect } from "next/navigation"
import { cache } from "react"

import { ADMIN_PASSWORD_CHANGE_REQUIRED_PATH } from "@/lib/utils/constants"
import type { AdminProfile } from "@/types/api/admin-auth.interface"

import { getMe } from "./endpoints/admin-auth"

/**
 * Sessão do admin sem barrar a senha temporária: só para "Minha conta" (trocar a senha), o cabeçalho do
 * painel e a action da troca, que o backend libera com a senha temporária (`GET /admin/me`, `/me/senha`).
 * Memoizado por requisição (`cache`): layout e página fazem um só `GET /admin/me`.
 */
export const getAdminSessionAllowingPasswordChange = cache(async (): Promise<AdminProfile> => getMe())

/**
 * Autorização do admin na camada de dados. O `proxy.ts` só renova o token e é pulado em prefetches
 * (e pelo matcher, se ele mudar), então toda página, componente ou server action do admin que leia
 * ou altere dados chama isto antes — e FORA de `try/catch`, para o `redirect()` não ser engolido.
 *
 * `getMe` passa pelo `adminFetch`: sem token redireciona ao login; com token revogado (401) vai a
 * `/admin/sair`. Com senha temporária (`trocarSenha`), vai a Minha conta trocar a senha (o backend
 * também responde 403 nas demais rotas, tratado no `adminFetch`).
 */
export const requireAdminSession = cache(async (): Promise<AdminProfile> => {
  const admin = await getAdminSessionAllowingPasswordChange()
  if (admin.trocarSenha) redirect(ADMIN_PASSWORD_CHANGE_REQUIRED_PATH)
  return admin
})
