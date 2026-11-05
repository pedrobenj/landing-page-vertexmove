"use server"

import { AuthError } from "next-auth"

import { signIn, signOut } from "@/auth"
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations/admin-login.schema"
import type { HttpResponse } from "@/types/http-response.interface"

export async function loginAdmin(input: AdminLoginInput): Promise<HttpResponse> {
  const parsed = adminLoginSchema.safeParse(input)
  if (!parsed.success) {
    return { status: 400, error: "Dados inválidos", title: "Verifique e-mail e senha" }
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/admin" })
    return { status: 200 }
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: 401, error: error.type, title: "E-mail ou senha incorretos" }
    }
    throw error // redirect do signIn precisa propagar
  }
}

export async function logoutAdmin() {
  await signOut({ redirectTo: "/admin/login" })
}
