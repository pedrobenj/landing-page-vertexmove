"use client"

import { unstable_rethrow } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

import { redeemAccessLinkAction } from "@/app/actions/registration-access"
import { ServerError } from "@/components/feedback"
import { SectionHeading } from "@/components/sections"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { API_ERROR_CODE } from "@/enums/api-error-code.enum"
import type { HttpResponse } from "@/types/http-response.interface"

import { InvalidAccessLink } from "./invalid-access-link"

const ACCESS_PATH = "/inscricao/acesso"
const NETWORK_ERROR = "Verifique sua conexão e tente de novo."

/**
 * Tira o token da barra de endereço quando a troca falha (no sucesso, o redirect `replace` já o tira do
 * histórico). Não dá para limpar antes da troca: o Next sincroniza o `replaceState` com o roteador e
 * re-renderiza a página sem o `t`, desmontando este componente no meio da troca.
 */
function cleanUrl() {
  window.history.replaceState(null, "", ACCESS_PATH)
}

interface AccessLinkRedeemerProps {
  /** O token que já está na URL do e-mail; sai da barra de endereço assim que a página abre. */
  token: string
}

/**
 * Troca o token do link pelo acesso à inscrição. A troca é um POST (server action) disparado pelo
 * navegador: o GET da página não gasta o token, então leitores de link de e-mail não o queimam. Se der
 * certo, a action grava o cookie e redireciona para `/inscricao/<codigo>`.
 */
export function AccessLinkRedeemer({ token }: AccessLinkRedeemerProps) {
  const [result, setResult] = useState<HttpResponse<never> | null>(null)
  const [isPending, startTransition] = useTransition()
  // Uso único: o efeito roda duas vezes no Strict Mode do dev e a segunda troca daria "link inválido".
  const started = useRef(false)

  function redeem() {
    startTransition(async () => {
      try {
        // Só volta resposta quando falha: no sucesso a action redireciona (com `replace`, tirando o token do histórico).
        setResult(await redeemAccessLinkAction(token))
        cleanUrl()
      } catch (error) {
        // O redirect da action chega aqui como erro interno do Next: precisa subir para o roteador navegar.
        unstable_rethrow(error)
        setResult({ status: 0, error: NETWORK_ERROR })
        cleanUrl()
      }
    })
  }

  function retry() {
    setResult(null)
    redeem()
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    redeem()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda uma vez por token
  }, [])

  if (result?.code === API_ERROR_CODE.ACCESS_LINK_INVALID) return <InvalidAccessLink />

  if (result && !isPending) {
    return (
      <>
        <SectionHeading as="h1" id="acesso-title" eyebrow="Acesso à inscrição" title="Não foi possível abrir a inscrição" />
        <ServerError
          title="Não foi possível abrir a inscrição"
          message={result.error ?? NETWORK_ERROR}
          action={
            <Button type="button" variant="outline" onClick={retry}>
              Tentar de novo
            </Button>
          }
        />
      </>
    )
  }

  return (
    <>
      <SectionHeading as="h1" id="acesso-title" eyebrow="Acesso à inscrição" title="Abrindo sua inscrição…" />
      <div role="status" aria-label="Abrindo sua inscrição" className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    </>
  )
}
