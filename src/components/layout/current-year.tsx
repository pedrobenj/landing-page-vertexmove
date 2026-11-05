import { cacheLife } from "next/cache"

/** Ano atual, cacheado (Cache Components não permite `new Date()` direto no prerender). */
export async function CurrentYear() {
  "use cache"
  cacheLife("days")
  return <>{new Date().getFullYear()}</>
}
