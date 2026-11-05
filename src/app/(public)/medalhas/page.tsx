import { permanentRedirect } from "next/navigation"

/** Página antiga de medalhas: agora faz parte da loja. */
export default function MedalsPage() {
  permanentRedirect("/loja#medalhas")
}
