"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

import { DEFAULT_STALE_TIME_MS } from "@/lib/utils/constants"

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: DEFAULT_STALE_TIME_MS, refetchOnWindowFocus: false } },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
