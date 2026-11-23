import Link from "next/link"

import { formatDateTime } from "@/lib/utils"
import type { MockAccessEmail } from "@/types/api/registration-access.interface"

interface MockEmailItemProps {
  email: MockAccessEmail
}

/** E-mail com o link de acesso, como o atleta o receberia. */
export function MockEmailItem({ email }: MockEmailItemProps) {
  return (
    <li>
      <article aria-label={`E-mail para ${email.para}`} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Para <strong className="text-foreground">{email.para}</strong> ·{" "}
          <time dateTime={email.enviadoEm}>{formatDateTime(email.enviadoEm)}</time>
        </p>
        <p className="text-sm">Link de acesso à inscrição {email.codigo} (válido por 30 minutos, uso único).</p>
        <Link href={email.link} prefetch={false} className="w-fit font-bold text-brand-navy underline underline-offset-4">
          Acessar minha inscrição
        </Link>
      </article>
    </li>
  )
}
