/** Host exato (`cdn.vertex.com.br`) ou curinga de subdomínio do `remotePatterns` (`*.x.com`, `**.x.com`). */
const HOST_PATTERN = /^(\*{1,2}\.)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i

/**
 * Hosts de imagem separados por vírgula (`IMAGE_REMOTE_HOSTS`) → lista sem espaços nem vazios.
 * Usado pelo `next.config.ts` (images.remotePatterns) e pela validação em `src/lib/env.ts`.
 */
export function parseImageHosts(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
}

/** Todos os hosts da lista têm formato válido para o `remotePatterns`? */
export function areValidImageHosts(hosts: string[]): boolean {
  return hosts.every((host) => HOST_PATTERN.test(host))
}
