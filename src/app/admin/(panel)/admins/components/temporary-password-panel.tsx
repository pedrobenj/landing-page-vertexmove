"use client"

import { Check, Copy, TriangleAlert } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface TemporaryPasswordPanelProps {
  password: string
  onDone: () => void
}

/** Senha temporária com botão de copiar e o aviso de que não aparece de novo. */
export function TemporaryPasswordPanel({ password, onDone }: TemporaryPasswordPanelProps) {
  const [isCopied, setIsCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(password)
      setIsCopied(true)
      toast.success("Senha copiada")
    } catch {
      toast.error("Não foi possível copiar", { description: "Selecione a senha e copie manualmente." })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        Esta senha não será mostrada de novo. Copie agora.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code data-testid="temporary-password" className="flex-1 rounded-lg border bg-slate-50 px-3 py-2 font-mono text-base break-all select-all">
          {password}
        </code>
        <Button type="button" variant="outline" onClick={() => void copy()}>
          {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {isCopied ? "Copiada" : "Copiar senha"}
        </Button>
      </div>
      <Button type="button" className="w-fit" onClick={onDone}>
        Já copiei
      </Button>
    </div>
  )
}
