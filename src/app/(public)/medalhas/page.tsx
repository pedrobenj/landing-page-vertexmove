import { permanentRedirect } from "next/navigation"

/** Página antiga de medalhas: agora é o filtro de medalhas da loja (§5 do CLAUDE.md). */
export default function MedalsPage() {
  permanentRedirect("/loja?tipo=medalhas")
}
