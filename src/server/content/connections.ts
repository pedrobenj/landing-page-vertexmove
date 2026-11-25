import "server-only"

import type { ConnectionPhoto } from "@/types/connection-photo.interface"

/**
 * Fotos das Conexões (treinos de sábado). Estático, como os parceiros: arquivos em `public/conexoes/`.
 * Vazio → a galeria mostra capas provisórias da marca. A primeira foto vira o destaque grande.
 */
// TODO(cliente): fotos das Conexões passadas, com uma descrição curta de cada (texto alternativo).
const CONNECTION_PHOTOS: ConnectionPhoto[] = []

export function getConnectionPhotos(): ConnectionPhoto[] {
  return CONNECTION_PHOTOS
}
