import { describe, expect, it } from "vitest"

import { ORDER_STATUS } from "@/enums/order-status.enum"
import { STORE_ORDER_ACTION } from "@/enums/store-order-action.enum"

import { getAvailableStoreOrderActions } from "./store-order-actions"

const actionsFor = (status: ORDER_STATUS) => getAvailableStoreOrderActions(status).map((config) => config.action)

describe("getAvailableStoreOrderActions", () => {
  it("segue as transições do backend (tarefa 10)", () => {
    expect(actionsFor(ORDER_STATUS.PENDING)).toEqual([STORE_ORDER_ACTION.CANCEL])
    expect(actionsFor(ORDER_STATUS.PAID)).toEqual([STORE_ORDER_ACTION.READY, STORE_ORDER_ACTION.CANCEL])
    expect(actionsFor(ORDER_STATUS.READY_FOR_PICKUP)).toEqual([STORE_ORDER_ACTION.PICKED_UP, STORE_ORDER_ACTION.CANCEL])
    for (const status of [ORDER_STATUS.PICKED_UP, ORDER_STATUS.CANCELLED, ORDER_STATUS.EXPIRED, ORDER_STATUS.REFUNDED]) {
      expect(actionsFor(status)).toEqual([])
    }
  })

  it("toda ação pede confirmação; cancelar pago avisa do estorno", () => {
    for (const status of Object.values(ORDER_STATUS)) {
      for (const config of getAvailableStoreOrderActions(status)) expect(config.confirmation.title).toBeTruthy()
    }
    const cancelPaid = getAvailableStoreOrderActions(ORDER_STATUS.PAID).find((config) => config.action === STORE_ORDER_ACTION.CANCEL)
    expect(cancelPaid).toMatchObject({ variant: "destructive" })
    expect(cancelPaid?.confirmation.description).toMatch(/estorno/)
    const cancelPending = getAvailableStoreOrderActions(ORDER_STATUS.PENDING)[0]
    expect(cancelPending.confirmation.description).toMatch(/estoque/)
  })
})
