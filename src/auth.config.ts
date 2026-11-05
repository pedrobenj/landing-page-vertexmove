import type { NextAuthConfig } from "next-auth"

/**
 * Configuração sem dependências de Node/Prisma, usada pelo proxy.ts.
 * Providers ficam em auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoginPage = nextUrl.pathname === "/admin/login"
      const isLoggedIn = Boolean(auth?.user)

      if (isLoginPage) {
        return isLoggedIn ? Response.redirect(new URL("/admin", nextUrl)) : true
      }
      return isLoggedIn
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    },
  },
} satisfies NextAuthConfig
