import { describe, expect, it } from "vitest"

import { isUniqueViolationOn } from "./unique-violation-target"

describe("isUniqueViolationOn", () => {
  it("lê meta.target em lista ou texto (formato clássico do Prisma)", () => {
    expect(isUniqueViolationOn({ target: ["slug"] }, "slug")).toBe(true)
    expect(isUniqueViolationOn({ target: "Product_slug_key" }, "slug")).toBe(true)
    expect(isUniqueViolationOn({ target: ["productId", "label"] }, "slug")).toBe(false)
  })

  it("lê o erro do driver adapter (Prisma 7): nome do índice ou campos", () => {
    const byIndex = { driverAdapterError: { cause: { kind: "UniqueConstraintViolation", constraint: { index: "Product_slug_key" } } } }
    const byFields = { driverAdapterError: { cause: { kind: "UniqueConstraintViolation", constraint: { fields: ["productId", "label"] } } } }
    expect(isUniqueViolationOn(byIndex, "slug")).toBe(true)
    expect(isUniqueViolationOn(byFields, "slug")).toBe(false)
    expect(isUniqueViolationOn(byFields, "label")).toBe(true)
  })

  it("devolve false para meta ausente ou desconhecido", () => {
    expect(isUniqueViolationOn(undefined, "slug")).toBe(false)
    expect(isUniqueViolationOn({ foo: 1 }, "slug")).toBe(false)
  })
})
