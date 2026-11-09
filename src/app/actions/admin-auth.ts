"use server"

import type { HttpResponse } from "@/types/http-response.interface"

// TODO(migracao): Task 7 — login/logout passam a usar a API VertexMove (cookies de sessão).
export async function loginAdmin(): Promise<HttpResponse> {
  return { status: 503, error: "Em migração", title: "Login do admin temporariamente indisponível" }
}

// TODO(migracao): Task 7 — logout via API e limpeza dos cookies de sessão.
export async function logoutAdmin(): Promise<void> {}
