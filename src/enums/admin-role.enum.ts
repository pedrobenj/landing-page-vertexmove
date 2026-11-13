/** `admin` é o papel único da fase 1 do backend (ADR-008). Os demais ficam para quando houver matriz de papéis. */
export enum ADMIN_ROLE {
  ADMIN = "admin",
  ORGANIZATION = "organizacao",
  OPERATOR = "operador",
  SUPER_ADMIN = "super_admin",
}
