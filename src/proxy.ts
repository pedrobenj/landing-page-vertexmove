import NextAuth from "next-auth"

import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

// Protege /admin/* (exceto /admin/login) — ver callback `authorized` em auth.config.ts.
export default auth

export const config = {
  matcher: ["/admin/:path*"],
}
