"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface CopyCodeButtonProps {
  code: string
}

const COPIED_FEEDBACK_MS = 2000

export function CopyCodeButton({ code }: CopyCodeButtonProps) {
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
      toast.success("Código copiado!")
    } catch {
      toast.error("Não foi possível copiar", { description: `Anote o código: ${code}` })
    }
  }

  return (
    <Button type="button" variant="cta" size="xl" onClick={handleCopy} className="w-full normal-case tracking-normal sm:w-auto">
      {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {isCopied ? "Copiado" : "Copiar código"}
    </Button>
  )
}
