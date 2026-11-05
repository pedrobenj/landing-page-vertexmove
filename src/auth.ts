import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { authConfig } from "@/auth.config"
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

        const admin = await db.adminUser.findUnique({ where: { email: parsed.data.email } })
        if (!admin) return null

        const isValid = await bcrypt.compare(parsed.data.password, admin.passwordHash)
        if (!isValid) return null

        return { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
      },
    }),
  ],
})
