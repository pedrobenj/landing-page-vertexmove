"use client"

import { useState, type ReactElement } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useCloseOnRouteChange } from "@/hooks/use-close-on-route-change"
import { useIsDesktop } from "@/hooks/use-media-query"

interface ConfirmDialogProps {
  /** Botão que abre a confirmação. */
  trigger: ReactElement
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  /** `destructive` para excluir/cancelar/encerrar. */
  variant?: "default" | "destructive"
  isPending?: boolean
  /** Fecha ao terminar (resolvida ou não); erros devem ser tratados (toast) por quem chama. */
  onConfirm: () => void | Promise<void>
}

/** Confirmação de ações destrutivas: Dialog no desktop, Drawer no mobile. Fecha na troca de rota. */
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
  const isDesktop = useIsDesktop()
  useCloseOnRouteChange(() => setIsOpen(false), isOpen)

  async function handleConfirm() {
    try {
      await onConfirm()
    } finally {
      setIsOpen(false)
    }
  }

  const confirmButton = (
    <Button
      type="button"
      variant={variant === "destructive" ? "destructive" : "default"}
      disabled={isPending}
      onClick={handleConfirm}
    >
      {isPending ? "Aguarde..." : confirmLabel}
    </Button>
  )
  const cancelButton = (
    <Button type="button" variant="outline" disabled={isPending} onClick={() => setIsOpen(false)}>
      {cancelLabel}
    </Button>
  )

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
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
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
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
  )
}
