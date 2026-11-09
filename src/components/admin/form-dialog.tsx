"use client"

import type { VariantProps } from "class-variance-authority"
import { type ReactNode, useState } from "react"

import { Button, type buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import { useIsDesktop } from "@/hooks/use-media-query"

interface FormDialogProps extends VariantProps<typeof buttonVariants> {
  /** Conteúdo do botão que abre o formulário. */
  triggerLabel: ReactNode
  /** Nome acessível do botão quando o rótulo visível é genérico (ex.: "Editar 5 km"). */
  triggerAriaLabel?: string
  title: string
  description?: string
  /**
   * O formulário. Recebe `close()` (chamar depois de salvar) e `setBusy()` (avisar que o envio está em
   * andamento: enquanto ocupado, o diálogo ignora Esc, clique fora e o "X", para não ser fechado e
   * reaberto no meio do envio e reenviado em duplicidade).
   */
  children: (controls: FormDialogControls) => ReactNode
}

export interface FormDialogControls {
  close: () => void
  setBusy: (busy: boolean) => void
}

/**
 * Formulário em Dialog (desktop) ou Drawer (mobile), fechando na troca de rota. Como no ConfirmDialog,
 * o gatilho fica fora do Dialog/Drawer para não ser remontado quando o `useIsDesktop` muda após a hidratação.
 */
export function FormDialog({ triggerLabel, triggerAriaLabel, title, description, variant = "outline", size, children }: FormDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isBusy, setBusy] = useState(false)
  const isDesktop = useIsDesktop()
  const close = () => {
    setBusy(false)
    setIsOpen(false)
  }
  useCloseOnRouteChange(close, isOpen)
  const handleOpenChange = (open: boolean) => {
    if (open || !isBusy) setIsOpen(open)
  }
  const controls: FormDialogControls = { close, setBusy }

  const trigger = (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={triggerAriaLabel}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      onClick={() => setIsOpen(true)}
    >
      {triggerLabel}
    </Button>
  )

  return (
    <>
      {trigger}
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            {isOpen && children(controls)}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-6">{isOpen && children(controls)}</div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
