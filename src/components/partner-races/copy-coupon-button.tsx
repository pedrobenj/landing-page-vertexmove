"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface CopyCouponButtonProps {
  code: string
}

const COPIED_FEEDBACK_MS = 2000

export function CopyCouponButton({ code }: CopyCouponButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!isCopied) return
    const timeout = setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS)
    return () => clearTimeout(timeout)
  }, [isCopied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      toast.success("Cupom copiado!", { description: `Use ${code} na inscrição.` })
    } catch {
      toast.error("Não foi possível copiar", { description: `Anote o cupom: ${code}` })
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={`Copiar cupom ${code}`}
      className="border-brand-green-text/40 bg-white text-brand-navy-deep hover:bg-brand-green/10"
    >
      {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {isCopied ? "Copiado" : "Copiar"}
    </Button>
  )
}
