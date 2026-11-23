/** `solicitacao_titular_status` (migration 0021): aberta → em_andamento → concluída | recusada (finais). */
export enum LGPD_REQUEST_STATUS {
  OPEN = "aberta",
  IN_PROGRESS = "em_andamento",
  FULFILLED = "concluida",
  REJECTED = "recusada",
}
