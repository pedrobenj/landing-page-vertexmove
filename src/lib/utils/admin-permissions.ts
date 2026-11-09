import { ADMIN_ROLE } from "@/enums/admin-role.enum"

/**
 * Papéis que cadastram e alteram corridas (e o catálogo delas). O operador só lê.
 * Matriz a confirmar com o backend (§16 do CLAUDE.md): a UI só esconde ações — a API decide e o
 * front sempre trata o 403.
 */
const EVENT_MANAGERS: ReadonlySet<string> = new Set([ADMIN_ROLE.ORGANIZATION, ADMIN_ROLE.SUPER_ADMIN])

export function canManageEvents(papel: ADMIN_ROLE | string): boolean {
  return EVENT_MANAGERS.has(papel)
}

/**
 * Papéis que cadastram e alteram produtos da loja. Por ora, os mesmos que gerenciam corridas.
 * Matriz a confirmar (§16): a loja ainda não existe no backend.
 */
export function canManageStore(papel: ADMIN_ROLE | string): boolean {
  return canManageEvents(papel)
}
