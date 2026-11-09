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
  /** O formulário; chama `close()` depois de salvar. */
  children: (close: () => void) => ReactNode
}

/**
 * Formulário em Dialog (desktop) ou Drawer (mobile), fechando na troca de rota. Como no ConfirmDialog,
 * o gatilho fica fora do Dialog/Drawer para não ser remontado quando o `useIsDesktop` muda após a hidratação.
 */
export function FormDialog({ triggerLabel, triggerAriaLabel, title, description, variant = "outline", size, children }: FormDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useIsDesktop()
  const close = () => setIsOpen(false)
  useCloseOnRouteChange(close, isOpen)

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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            {isOpen && children(close)}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-6">{isOpen && children(close)}</div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
