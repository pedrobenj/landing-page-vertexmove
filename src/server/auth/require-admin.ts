import "server-only"

import { auth } from "@/auth"

/** Retorna a sessão do admin ou null. Toda action/página de admin deve checar. */
export async function getAdminSession() {
  const session = await auth()
  return session?.user ? session : null
}
