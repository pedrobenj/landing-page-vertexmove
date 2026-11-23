import "server-only"

import type {
  ChangeOwnPasswordInput,
  CreatedManagedAdmin,
  ManagedAdmin,
  ManagedAdminInput,
  TemporaryPassword,
} from "@/types/api/managed-admin.interface"

import { adminFetch } from "../admin-fetch"

/** `GET /admin/admins`: ativos e inativos, por nome (array simples). */
export async function listManagedAdmins(): Promise<ManagedAdmin[]> {
  return adminFetch("/admin/admins")
}

/** `POST /admin/admins` (201): devolve a senha temporária, que não é mostrada de novo. */
export async function createManagedAdmin(input: ManagedAdminInput): Promise<CreatedManagedAdmin> {
  return adminFetch("/admin/admins", { method: "POST", body: input })
}

/** `POST /admin/admins/:id/desativar` (idempotente; revoga as sessões do alvo). */
export async function deactivateManagedAdmin(id: number): Promise<ManagedAdmin> {
  return adminFetch(`/admin/admins/${id}/desativar`, { method: "POST" })
}

/** `POST /admin/admins/:id/reativar` (idempotente). */
export async function reactivateManagedAdmin(id: number): Promise<ManagedAdmin> {
  return adminFetch(`/admin/admins/${id}/reativar`, { method: "POST" })
}

/** `POST /admin/admins/:id/redefinir-senha`: nova senha temporária (revoga as sessões do alvo). */
export async function resetManagedAdminPassword(id: number): Promise<TemporaryPassword> {
  return adminFetch(`/admin/admins/${id}/redefinir-senha`, { method: "POST" })
}

/** `POST /admin/me/senha` (204): revoga TODAS as sessões do próprio admin, inclusive a atual. */
export async function changeOwnPassword(input: ChangeOwnPasswordInput): Promise<void> {
  await adminFetch<void>("/admin/me/senha", { method: "POST", body: input })
}
