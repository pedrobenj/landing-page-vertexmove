import "server-only"

import type { MockRoute } from "./mock-http"
import { adminCatalogRoutes } from "./routes/admin-catalog-routes"
import { adminEventRoutes } from "./routes/admin-event-routes"
import { adminManagementRoutes } from "./routes/admin-management-routes"
import { adminPaymentRoutes } from "./routes/admin-payment-routes"
import { adminRegistrationRoutes } from "./routes/admin-registration-routes"
import { authRoutes } from "./routes/auth-routes"
import { lgpdRoutes } from "./routes/lgpd-routes"
import { partnerRaceRoutes } from "./routes/partner-race-routes"
import { publicRoutes } from "./routes/public-routes"
import { registrationRoutes } from "./routes/registration-routes"
import { storeRoutes } from "./routes/store-routes"

/**
 * Tabela de rotas do mock, na ordem de prioridade: as rotas de catálogo vêm antes das ações
 * do evento porque `/admin/eventos/:id/:acao` também casaria com `/distancias` e `/kits`.
 */
export const mockRoutes: MockRoute[] = [
  ...publicRoutes,
  ...partnerRaceRoutes,
  ...registrationRoutes,
  ...lgpdRoutes,
  ...storeRoutes,
  ...authRoutes,
  ...adminManagementRoutes,
  ...adminCatalogRoutes,
  ...adminRegistrationRoutes,
  ...adminPaymentRoutes,
  ...adminEventRoutes,
]
