import "server-only"

import { cache } from "react"

import type { AdminProfile } from "@/types/api/admin-auth.interface"

import { getMe } from "./endpoints/admin-auth"

/**
 * Autorização do admin na camada de dados. O `proxy.ts` só renova o token e é pulado em prefetches
 * (e pelo matcher, se ele mudar), então toda página, componente ou server action do admin que leia
 * ou altere dados chama isto antes — e FORA de `try/catch`, para o `redirect()` não ser engolido.
 *
 * `getMe` passa pelo `adminFetch`: sem token redireciona ao login; com token revogado (401) vai a
 * `/admin/sair`. Memoizado por requisição (`cache`), então layout e página fazem um só `GET /admin/me`.
 */
export const requireAdminSession = cache(async (): Promise<AdminProfile> => getMe())
