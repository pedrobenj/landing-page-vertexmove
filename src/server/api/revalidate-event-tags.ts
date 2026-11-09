import "server-only"

import { revalidateTag } from "next/cache"

/**
 * Invalida o catálogo público depois de uma mutação no admin: a tag `events` (lista, encerradas,
 * sitemap) e `event:<slug>` de cada slug informado — o antigo e o novo, quando o slug muda.
 *
 * `{ expire: 0 }` em vez de `"max"`: uma corrida despublicada, cancelada ou excluída não pode continuar
 * sendo servida (nem stale) ao público; a próxima visita refaz a busca.
 */
export function revalidateEventTags(...slugs: (string | null | undefined)[]): void {
  revalidateTag("events", { expire: 0 })
  for (const slug of new Set(slugs.filter((slug): slug is string => Boolean(slug)))) {
    revalidateTag(`event:${slug}`, { expire: 0 })
  }
}
