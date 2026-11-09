import { NextResponse } from "next/server"

// TODO(migracao): Task 7 — proxy temporário que só deixa passar; a proteção de /admin/* volta com a sessão da API.
export default function proxy() {
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
