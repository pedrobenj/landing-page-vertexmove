import { ServerError } from "@/components/feedback"

// TODO(migracao): Task 7 — formulário de login (email + senha) integrado à API VertexMove.
export function AdminLoginForm() {
  return (
    <ServerError
      title="Login temporariamente indisponível"
      message="A área do organizador está em manutenção. Tente novamente em breve."
    />
  )
}
