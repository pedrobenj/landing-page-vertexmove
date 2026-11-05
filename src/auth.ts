import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { authConfig } from "@/auth.config"
import { env } from "@/lib/env"
import { adminLoginSchema } from "@/lib/validations/admin-login.schema"
import { db } from "@/server/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = adminLoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        if (env.USE_MOCK_DATA) {
          // Import dinâmico: as credenciais mockadas só são carregadas em modo mock.
          const { MOCK_ADMIN } = await import("@/server/mocks/admin-user.mock")
          const isMockAdmin = parsed.data.email === MOCK_ADMIN.email && parsed.data.password === MOCK_ADMIN.password
          return isMockAdmin ? { id: MOCK_ADMIN.id, name: MOCK_ADMIN.name, email: MOCK_ADMIN.email, role: MOCK_ADMIN.role } : null
        }

        const admin = await db.adminUser.findUnique({ where: { email: parsed.data.email } })
        if (!admin) return null

        const isValid = await bcrypt.compare(parsed.data.password, admin.passwordHash)
        if (!isValid) return null

        return { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
      },
    }),
  ],
})
