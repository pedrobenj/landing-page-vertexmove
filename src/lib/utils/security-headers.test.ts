import { describe, expect, it } from "vitest"

import { getSecurityHeaders } from "./security-headers"

const find = (headers: Array<{ key: string; value: string }>, key: string) => headers.find((header) => header.key === key)

describe("getSecurityHeaders", () => {
  it("em produção inclui HSTS com preload", () => {
    expect(find(getSecurityHeaders("production"), "Strict-Transport-Security")?.value).toBe(
      "max-age=63072000; includeSubDomains; preload",
    )
  })

  it.each(["development", "test", undefined])("fora de produção (%s) não manda HSTS", (nodeEnv) => {
    expect(find(getSecurityHeaders(nodeEnv), "Strict-Transport-Security")).toBeUndefined()
  })

  it("mantém CSP, nosniff, frame e Permissions-Policy", () => {
    const headers = getSecurityHeaders("production")
    expect(find(headers, "Content-Security-Policy")?.value).toContain("frame-ancestors 'none'")
    expect(find(headers, "X-Content-Type-Options")?.value).toBe("nosniff")
    expect(find(headers, "X-Frame-Options")?.value).toBe("DENY")
    expect(find(headers, "Permissions-Policy")).toBeDefined()
  })

  it("'unsafe-eval' só no next dev", () => {
    expect(find(getSecurityHeaders("development"), "Content-Security-Policy")?.value).toContain("'unsafe-eval'")
    expect(find(getSecurityHeaders("production"), "Content-Security-Policy")?.value).not.toContain("'unsafe-eval'")
  })
})
