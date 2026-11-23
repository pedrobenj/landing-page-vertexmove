import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { formatDateTimeSafe } from "@/lib/utils/format-date"
import type { LgpdRequestReceipt } from "@/types/api/lgpd-request.interface"

interface LgpdRequestSuccessProps {
  receipt: Pick<LgpdRequestReceipt, "protocolo" | "prazoEm">
}

/** Só protocolo e prazo: a mesma tela para qualquer CPF (não revela se há cadastro). */
export function LgpdRequestSuccess({ receipt }: LgpdRequestSuccessProps) {
  return (
    <div role="status" className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
      <CheckCircle2 aria-hidden="true" className="size-10 text-brand-green-text" />
      <h2 className="font-heading text-2xl font-black text-brand-navy-deep">Solicitação recebida</h2>
      <p>
        Seu protocolo é <strong className="font-mono text-lg tabular-nums">{receipt.protocolo}</strong>. Guarde este número.
      </p>
      <p className="text-muted-foreground">
        Vamos analisar o pedido e responder pelo contato informado até {formatDateTimeSafe(receipt.prazoEm)}. Se precisarmos confirmar sua
        identidade, falaremos com você por esse mesmo contato.
      </p>
      <Button asChild variant="outline" className="w-full sm:w-auto sm:self-start">
        <Link href="/privacidade">Voltar à política de privacidade</Link>
      </Button>
    </div>
  )
}
