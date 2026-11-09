import "server-only"

import { updateTag } from "next/cache"

interface RevalidateEventTagsOptions {
  /**
   * Também invalida `events` (lista, encerradas, sitemap e todos os detalhes). Padrão `true`. Use `false`
   * quando a mudança só aparece na página da corrida (kits, documentos).
   */
  includeList?: boolean
}

/**
 * Invalida o catálogo público depois de uma mutação no admin: a tag `events` (salvo `includeList: false`)
 * e `event:<slug>` de cada slug informado — o antigo e o novo, quando o slug muda.
 *
 * `updateTag` (read-your-own-writes): só pode ser chamado de server actions — e é só delas que este
 * helper é chamado. A próxima requisição espera os dados novos em vez de servir o cache antigo, então
 * uma corrida despublicada, cancelada ou excluída sai do site na hora.
 */
export function revalidateEventTags(
  slugs: string | readonly (string | null | undefined)[] = [],
  { includeList = true }: RevalidateEventTagsOptions = {},
): void {
  if (includeList) updateTag("events")
  const list = typeof slugs === "string" ? [slugs] : slugs
  for (const slug of new Set(list.filter((slug): slug is string => Boolean(slug)))) {
    updateTag(`event:${slug}`)
  }
}
