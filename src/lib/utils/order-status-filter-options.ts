import { ORDER_STATUS, ORDER_STATUS_LABEL } from "@/enums/order-status.enum"

export type StoreOrderStatusFilter = ORDER_STATUS | "todos"

/** Opções do filtro de status da lista de pedidos do admin. */
export const ORDER_STATUS_FILTER_OPTIONS: readonly { value: StoreOrderStatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  ...Object.values(ORDER_STATUS).map((status) => ({ value: status, label: ORDER_STATUS_LABEL[status] })),
]

export function isStoreOrderStatusFilter(value: string): value is StoreOrderStatusFilter {
  return ORDER_STATUS_FILTER_OPTIONS.some((option) => option.value === value)
}
