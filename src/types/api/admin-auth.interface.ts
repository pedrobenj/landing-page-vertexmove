import type { ADMIN_ROLE } from "@/enums/admin-role.enum"

/** `GET /admin/me` */
export interface AdminProfile {
  id: number
  nome: string
  email: string
  papel: ADMIN_ROLE
  mfaAtivo: boolean
}

/** `POST /admin/auth/login` (200). O refresh token vem no `Set-Cookie`. */
export interface AdminLoginResponse {
  accessToken: string
  tokenType: "Bearer"
  expiresIn: number
  csrfToken: string
  admin: Omit<AdminProfile, "email">
}

/** `POST /admin/auth/refresh` (200). */
export interface AdminRefreshResponse {
  accessToken: string
  expiresIn: number
  csrfToken: string
}
