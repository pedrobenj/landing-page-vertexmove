"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/** Fecha dialogs/drawers/popovers quando a rota muda. */
export function useCloseOnRouteChange(onClose: () => void, isOpen: boolean) {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname
      if (isOpen) onCloseRef.current()
    }
  }, [pathname, isOpen])
}
