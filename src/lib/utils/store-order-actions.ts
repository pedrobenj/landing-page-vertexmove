import { ORDER_STATUS } from "@/enums/order-status.enum"
import { STORE_ORDER_ACTION } from "@/enums/store-order-action.enum"

export interface StoreOrderActionConfig {
  action: STORE_ORDER_ACTION
  label: string
  variant: "default" | "destructive"
  confirmation: { title: string; description: string; confirmLabel: string }
  successMessage: string
}

const READY: StoreOrderActionConfig = {
  action: STORE_ORDER_ACTION.READY,
  label: "Pronto para retirada",
  variant: "default",
  confirmation: {
    title: "Marcar como pronto para retirada?",
    description: "Confirme que os itens foram separados e estão no local de retirada.",
    confirmLabel: "Marcar como pronto",
  },
  successMessage: "Pedido pronto para retirada",
}

const PICKED_UP: StoreOrderActionConfig = {
  action: STORE_ORDER_ACTION.PICKED_UP,
  label: "Retirado",
  variant: "default",
  confirmation: {
    title: "Registrar a retirada?",
    description: "Confira o código do pedido e um documento com foto de quem está retirando.",
    confirmLabel: "Registrar retirada",
  },
  successMessage: "Retirada registrada",
}

const CANCEL_PENDING: StoreOrderActionConfig = {
  action: STORE_ORDER_ACTION.CANCEL,
  label: "Cancelar pedido",
  variant: "destructive",
  confirmation: {
    title: "Cancelar este pedido?",
    description: "O pedido ainda não foi pago: os itens voltam para o estoque. Esta ação não pode ser desfeita.",
    confirmLabel: "Cancelar pedido",
  },
  successMessage: "Pedido cancelado",
}

const CANCEL_PAID: StoreOrderActionConfig = {
  ...CANCEL_PENDING,
  confirmation: {
    title: "Cancelar e estornar este pedido?",
    description: "O pedido já foi pago: o estorno é pedido ao Mercado Pago e o pedido vira reembolsado quando ele confirmar. Esta ação não pode ser desfeita.",
    confirmLabel: "Cancelar e estornar",
  },
  successMessage: "Cancelamento registrado; o estorno foi solicitado",
}

/** Transições permitidas pelo backend: pago → pronto → retirado; pendente/pago/pronto → cancelado. */
const ACTIONS_BY_STATUS: Partial<Record<ORDER_STATUS, StoreOrderActionConfig[]>> = {
  [ORDER_STATUS.PENDING]: [CANCEL_PENDING],
  [ORDER_STATUS.PAID]: [READY, CANCEL_PAID],
  [ORDER_STATUS.READY_FOR_PICKUP]: [PICKED_UP, CANCEL_PAID],
}

/** Ações que o admin pode executar no status atual (a API decide de novo e responde 409 se mudou). */
export function getAvailableStoreOrderActions(status: ORDER_STATUS): StoreOrderActionConfig[] {
  return ACTIONS_BY_STATUS[status] ?? []
}
