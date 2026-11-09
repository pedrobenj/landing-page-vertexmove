import { describe, expect, it } from "vitest"

import { CART_ISSUE_REASON } from "@/enums/cart-issue-reason.enum"
import type { CartIssue } from "@/types/cart.interface"

import { getCartIssueToastId } from "./get-cart-issue-toast-id"

const issue = (overrides: Partial<CartIssue> = {}): CartIssue => ({
  variantId: "mock-var-1-m",
  reason: CART_ISSUE_REASON.UNAVAILABLE,
  availableQuantity: 0,
  message: "Esgotado",
  ...overrides,
})

describe("getCartIssueToastId", () => {
  it("é estável para o mesmo aviso", () => {
    expect(getCartIssueToastId(issue())).toBe(getCartIssueToastId(issue({ message: "Outro texto" })))
  })

  it("difere por variante e por quantidade disponível", () => {
    expect(getCartIssueToastId(issue())).not.toBe(getCartIssueToastId(issue({ variantId: "mock-var-2-m" })))
    expect(getCartIssueToastId(issue())).not.toBe(getCartIssueToastId(issue({ availableQuantity: 2 })))
  })
})
