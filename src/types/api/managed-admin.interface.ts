import type { ADMIN_ROLE } from "@/enums/admin-role.enum"

/** Item de `GET /admin/admins` e resposta das ações (`AdminGerenciadoResponse` do backend). */
export interface ManagedAdmin {
  id: number
  nome: string
  email: string
  papel: ADMIN_ROLE
  ativo: boolean
  ultimoAcessoEm: string | null // ISO
  criadoEm: string // ISO
}

/** `POST /admin/admins` (201): a senha temporária aparece só nesta resposta. */
export interface CreatedManagedAdmin {
  admin: ManagedAdmin
  senhaTemporaria: string
}

/** `POST /admin/admins/:id/redefinir-senha` (200). */
export interface TemporaryPassword {
  senhaTemporaria: string
}

/** Corpo de `POST /admin/admins` (estrito; sem senha: o sistema gera uma temporária). */
export interface ManagedAdminInput {
  nome: string
  email: string
}

/** Corpo de `POST /admin/me/senha` (204; revoga todas as sessões do próprio admin). */
export interface ChangeOwnPasswordInput {
  senhaAtual: string
  novaSenha: string
}
