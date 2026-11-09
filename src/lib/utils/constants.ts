export const APP_TIME_ZONE = "America/Fortaleza"
export const DEFAULT_STALE_TIME_MS = 5 * 60 * 1000
export const ORDER_RESERVATION_MINUTES = 30
export const MAX_QUANTITY_PER_ITEM = 10
export const MAX_ITEMS_PER_ORDER = 20
// Limites do cadastro de produto.
export const MAX_PRODUCT_PRICE_CENTS = 1_000_000
export const MAX_VARIANT_STOCK = 100_000
export const MAX_VARIANT_LABEL_LENGTH = 10
// Rotas da sessão do admin (proxy.ts, adminFetch, login/logout).
export const ADMIN_HOME_PATH = "/admin"
export const ADMIN_LOGIN_PATH = "/admin/login"
/** Route handler que apaga os cookies de sessão e manda ao login com o aviso de sessão expirada. */
export const ADMIN_SESSION_EXPIRED_PATH = "/admin/sair"
/** Query string do login quando a sessão expirou ou foi revogada. */
export const ADMIN_SESSION_EXPIRED_PARAM = "expirada"
