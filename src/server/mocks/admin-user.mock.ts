/** Login do admin quando USE_MOCK_DATA=true (bloqueado em produção pelo env.ts). */
export const MOCK_ADMIN = {
  id: "mock-admin",
  name: "Admin Vertex (mock)",
  email: "admin@vertex.dev",
  password: "vertex-admin-123",
  role: "OWNER",
} as const
