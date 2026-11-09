import "server-only"

import { updateTag } from "next/cache"

/**
 * Invalida o catálogo público depois de uma mutação no admin: a tag `events` (lista, encerradas,
 * sitemap e todos os detalhes) e `event:<slug>` de cada slug informado — o antigo e o novo, quando o
 * slug muda.
 *
 * `updateTag` (read-your-own-writes): só pode ser chamado de server actions — e é só delas que este
 * helper é chamado. A próxima requisição espera os dados novos em vez de servir o cache antigo, então
 * uma corrida despublicada, cancelada ou excluída sai do site na hora.
 */
export function revalidateEventTags(...slugs: (string | null | undefined)[]): void {
  updateTag("events")
  for (const slug of new Set(slugs.filter((slug): slug is string => Boolean(slug)))) {
    updateTag(`event:${slug}`)
  }
}
