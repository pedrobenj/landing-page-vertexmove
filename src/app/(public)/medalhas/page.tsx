import { redirect } from "next/navigation"

/** Página antiga de medalhas: agora faz parte da loja. */
export default function MedalsPage() {
  redirect("/loja#medalhas")
}
