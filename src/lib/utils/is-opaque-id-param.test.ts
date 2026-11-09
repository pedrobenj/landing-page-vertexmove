import { describe, expect, it } from "vitest"

import { isOpaqueIdParam } from "./is-opaque-id-param"

describe("isOpaqueIdParam", () => {
  it.each(["mock-prod-1", "mock-prod-3f2b9c1e-8a7d-4e0f-9b1a-2c3d4e5f6a7b", "clx9a8b7c0000abcd1234efgh", "42"])("aceita %j", (value) => {
    expect(isOpaqueIdParam(value)).toBe(true)
  })

  it.each(["", " ", "mock prod", "../etc", "a/b", "a%2Fb", "x".repeat(65)])("rejeita %j", (value) => {
    expect(isOpaqueIdParam(value)).toBe(false)
  })
})
