"use client"

import { cloneElement, type MouseEvent, type ReactElement, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import { useIsDesktop } from "@/hooks/use-media-query"

interface ConfirmDialogProps {
  /** Botão que abre a confirmação (recebe `onClick`, `aria-haspopup` e `aria-expanded`). */
  trigger: ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  /** `destructive` para excluir/cancelar/encerrar. */
  variant?: "default" | "destructive"
  isPending?: boolean
  /**
   * O diálogo fica aberto (com "Aguarde...") até a Promise terminar e fecha em seguida, com sucesso ou
   * não; erros devem ser tratados (toast) por quem chama.
   */
  onConfirm: () => Promise<void>
}

/**
 * Confirmação de ações destrutivas: Dialog no desktop, Drawer no mobile. Fecha na troca de rota.
 * O gatilho fica fora do Dialog/Drawer: assim ele não é remontado quando o `useIsDesktop` troca de
 * valor logo depois da hidratação (o servidor sempre renderiza a versão mobile), e o clique não se perde.
 * Ao fechar, o Radix/vaul devolvem o foco ao elemento focado antes de abrir (o gatilho).
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel = "Voltar",
  variant = "default",
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const isDesktop = useIsDesktop()
  useCloseOnRouteChange(() => setIsOpen(false), isOpen)

  const isBusy = isPending || isConfirming
  const handleOpenChange = (open: boolean) => {
    if (!isBusy) setIsOpen(open)
  }

  async function handleConfirm() {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
      setIsOpen(false)
    }
  }

  const triggerElement = cloneElement(trigger, {
    onClick: () => setIsOpen(true),
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
  } as Partial<typeof trigger.props>)

  const confirmButton = (
    <Button type="button" variant={variant === "destructive" ? "destructive" : "default"} disabled={isBusy} onClick={handleConfirm}>
      {isBusy ? "Aguarde..." : confirmLabel}
    </Button>
  )
  const cancelButton = (
    <Button type="button" variant="outline" disabled={isBusy} onClick={() => setIsOpen(false)}>
      {cancelLabel}
    </Button>
  )

  return (
    <>
      {triggerElement}
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
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
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
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
