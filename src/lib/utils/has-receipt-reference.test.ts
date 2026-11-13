import { describe, expect, it } from "vitest"

import { hasReceiptReference } from "./has-receipt-reference"

describe("hasReceiptReference", () => {
  it("só libera o comprovante quando a API envia referência", () => {
    expect(hasReceiptReference({ referencia: "abc" })).toBe(true)
    expect(hasReceiptReference({})).toBe(false)
    expect(hasReceiptReference({ referencia: "" })).toBe(false)
  })
})
