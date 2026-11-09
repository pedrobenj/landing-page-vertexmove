/** Ações do ciclo de vida: `POST /admin/eventos/:id/<acao>` (204). */
export enum EVENT_ACTION {
  PUBLISH = "publicar",
  UNPUBLISH = "despublicar",
  CLOSE = "encerrar",
  CANCEL = "cancelar",
  RESTORE = "restaurar",
}
