import { EVENT_ACTION } from "@/enums/event-action.enum"
import { EVENT_STATUS } from "@/enums/event-status.enum"

/** Exclusão (soft delete, `DELETE /admin/eventos/:id`) entra junto das ações de ciclo de vida. */
export const DELETE_EVENT_ACTION = "excluir"

export type EventLifecycleAction = EVENT_ACTION | typeof DELETE_EVENT_ACTION

export interface EventLifecycleConfirmation {
  title: string
  description: string
  confirmLabel: string
}

export interface EventLifecycleActionConfig {
  action: EventLifecycleAction
  label: string
  /** Texto do toast de sucesso. */
  successMessage: string
  variant: "cta" | "outline" | "destructive"
  /** Presente nas ações destrutivas (encerrar, cancelar, excluir). */
  confirmation?: EventLifecycleConfirmation
}

const CONFIGS: Record<EventLifecycleAction, EventLifecycleActionConfig> = {
  [EVENT_ACTION.PUBLISH]: {
    action: EVENT_ACTION.PUBLISH,
    label: "Publicar",
    successMessage: "Corrida publicada: já aparece no site.",
    variant: "cta",
  },
  [EVENT_ACTION.UNPUBLISH]: {
    action: EVENT_ACTION.UNPUBLISH,
    label: "Despublicar",
    successMessage: "Corrida despublicada: voltou a rascunho.",
    variant: "outline",
  },
  [EVENT_ACTION.CLOSE]: {
    action: EVENT_ACTION.CLOSE,
    label: "Encerrar",
    successMessage: "Corrida encerrada.",
    variant: "outline",
    confirmation: {
      title: "Encerrar esta corrida?",
      description: "Ela sai da lista de corridas abertas e as inscrições são fechadas. Dá para restaurar depois.",
      confirmLabel: "Encerrar corrida",
    },
  },
  [EVENT_ACTION.CANCEL]: {
    action: EVENT_ACTION.CANCEL,
    label: "Cancelar corrida",
    successMessage: "Corrida cancelada.",
    variant: "destructive",
    confirmation: {
      title: "Cancelar esta corrida?",
      description: "Ela sai do site e não aceita mais inscrições. Dá para restaurar depois, como rascunho.",
      confirmLabel: "Cancelar corrida",
    },
  },
  [EVENT_ACTION.RESTORE]: {
    action: EVENT_ACTION.RESTORE,
    label: "Restaurar",
    successMessage: "Corrida restaurada como rascunho.",
    variant: "outline",
  },
  [DELETE_EVENT_ACTION]: {
    action: DELETE_EVENT_ACTION,
    label: "Excluir",
    successMessage: "Corrida excluída.",
    variant: "destructive",
    confirmation: {
      title: "Excluir esta corrida?",
      description: "Ela some do painel e do site. Esta ação não pode ser desfeita por aqui.",
      confirmLabel: "Excluir corrida",
    },
  },
}

const { PUBLISH, UNPUBLISH, CLOSE, CANCEL, RESTORE } = EVENT_ACTION

/**
 * Ações válidas por status (as transições do mock; lista de status a confirmar, §16).
 * Corrida publicada não é excluída direto: despublique, encerre ou cancele antes (decisão da UI).
 * A confirmar com o backend (§16): se excluir uma corrida encerrada (histórico público) e cancelar
 * um rascunho (em vez de só excluí-lo) são permitidos.
 */
const ACTIONS_BY_STATUS: Record<EVENT_STATUS, EventLifecycleAction[]> = {
  [EVENT_STATUS.DRAFT]: [PUBLISH, CANCEL, DELETE_EVENT_ACTION],
  [EVENT_STATUS.PUBLISHED]: [UNPUBLISH, CLOSE, CANCEL],
  [EVENT_STATUS.CLOSED]: [RESTORE, DELETE_EVENT_ACTION],
  [EVENT_STATUS.CANCELLED]: [RESTORE, DELETE_EVENT_ACTION],
  [EVENT_STATUS.ARCHIVED]: [DELETE_EVENT_ACTION],
}

/** Ações do ciclo de vida disponíveis para o status atual (status desconhecido → nenhuma). */
export function getAvailableEventActions(status: EVENT_STATUS | string): EventLifecycleActionConfig[] {
  const actions = (ACTIONS_BY_STATUS as Partial<Record<string, EventLifecycleAction[]>>)[status] ?? []
  return actions.map((action) => CONFIGS[action])
}

export function isEventLifecycleAction(value: string): value is EventLifecycleAction {
  return Object.hasOwn(CONFIGS, value)
}
