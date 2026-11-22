"use client"

import { cloneElement, type MouseEvent, type ReactElement, useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import { useIsDesktop } from "@/hooks/use-media-query"

interface ConfirmStep {
  title: string
  description: string
  confirmLabel: string
}

interface DoubleConfirmDialogProps {
  /** Botão que abre a confirmação (recebe `onClick`, `aria-haspopup` e `aria-expanded`). */
  trigger: ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>
  /** 1º passo: explica a consequência. O botão leva ao 2º passo. */
  first: ConfirmStep
  /** 2º passo: confirmação final (botão vermelho). */
  second: ConfirmStep
  /** Campo de motivo obrigatório no 1º passo (ex.: estorno). */
  reason?: { label: string; maxLength: number }
  /**
   * Fica aberto (com "Aguarde...") até a Promise terminar e fecha em seguida, com sucesso ou não; erros
   * devem ser tratados (toast) por quem chama.
   */
  onConfirm: (reason: string) => Promise<void>
}

/**
 * Confirmação dupla para ações destrutivas sem volta (cancelar inscrição, estornar pagamento — decisão
 * D6): dois passos no mesmo Dialog (desktop) ou Drawer (mobile). Fecha na troca de rota.
 */
export function DoubleConfirmDialog({ trigger, first, second, reason, onConfirm }: DoubleConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [reasonText, setReasonText] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)
  const isDesktop = useIsDesktop()
  const reasonId = useId()
  useCloseOnRouteChange(() => setIsOpen(false), isOpen)

  const current = step === 1 ? first : second
  const reasonMissing = Boolean(reason) && reasonText.trim().length === 0

  function open() {
    setStep(1)
    setReasonText("")
    setIsOpen(true)
  }

  function handleOpenChange(next: boolean) {
    if (!isConfirming) setIsOpen(next)
  }

  async function handleConfirm() {
    if (step === 1) {
      setStep(2)
      return
    }
    setIsConfirming(true)
    try {
      await onConfirm(reasonText.trim())
    } finally {
      setIsConfirming(false)
      setIsOpen(false)
    }
  }

  const triggerElement = cloneElement(trigger, {
    onClick: open,
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
  } as Partial<typeof trigger.props>)

  const reasonField =
    reason && step === 1 ? (
      <div className="flex flex-col gap-2 px-4 md:px-0">
        <Label htmlFor={reasonId}>{reason.label}</Label>
        <Textarea
          id={reasonId}
          value={reasonText}
          maxLength={reason.maxLength}
          onChange={(event) => setReasonText(event.target.value)}
          required
        />
      </div>
    ) : null

  const confirmButton = (
    <Button
      type="button"
      variant={step === 1 ? "default" : "destructive"}
      disabled={isConfirming || reasonMissing}
      onClick={handleConfirm}
    >
      {isConfirming ? "Aguarde..." : current.confirmLabel}
    </Button>
  )
  const cancelButton = (
    <Button type="button" variant="outline" disabled={isConfirming} onClick={() => (step === 2 ? setStep(1) : setIsOpen(false))}>
      Voltar
    </Button>
  )

  return (
    <>
      {triggerElement}
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{current.title}</DialogTitle>
              <DialogDescription>{current.description}</DialogDescription>
            </DialogHeader>
            {reasonField}
            <DialogFooter>
              {cancelButton}
              {confirmButton}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{current.title}</DrawerTitle>
              <DrawerDescription>{current.description}</DrawerDescription>
            </DrawerHeader>
            {reasonField}
            <DrawerFooter>
              {confirmButton}
              {cancelButton}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
