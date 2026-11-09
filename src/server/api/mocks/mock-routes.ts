import "server-only"

import type { MockRoute } from "./mock-http"
import { adminCatalogRoutes } from "./routes/admin-catalog-routes"
import { adminEventRoutes } from "./routes/admin-event-routes"
import { authRoutes } from "./routes/auth-routes"
import { publicRoutes } from "./routes/public-routes"
import { registrationRoutes } from "./routes/registration-routes"

/**
 * Tabela de rotas do mock, na ordem de prioridade: as rotas de catálogo vêm antes das ações
 * do evento porque `/admin/eventos/:id/:acao` também casaria com `/distancias` e `/kits`.
 */
export const mockRoutes: MockRoute[] = [
  ...publicRoutes,
  ...registrationRoutes,
  ...authRoutes,
  ...adminCatalogRoutes,
  ...adminEventRoutes,
]
