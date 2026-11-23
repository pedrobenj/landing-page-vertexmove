"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"

import { TemporaryPasswordPanel } from "./temporary-password-panel"

interface TemporaryPasswordDialogProps {
  adminName: string
  /** Senha recém-gerada; `null` = fechado. Só existe em memória até o diálogo fechar. */
  password: string | null
  onClose: () => void
}

/** Mostra a senha temporária gerada pela redefinição, uma única vez. */
export function TemporaryPasswordDialog({ adminName, password, onClose }: TemporaryPasswordDialogProps) {
  const isOpen = password !== null
  useCloseOnRouteChange(onClose, isOpen)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova senha de {adminName}</DialogTitle>
          <DialogDescription>Envie à pessoa por um canal seguro e oriente a trocar em Minha conta.</DialogDescription>
        </DialogHeader>
        {password && <TemporaryPasswordPanel password={password} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
