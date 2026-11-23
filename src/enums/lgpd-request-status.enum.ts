/** Situação da solicitação do titular no backend (tabela `solicitacao_titular`). */
export enum LGPD_REQUEST_STATUS {
  OPEN = "aberta",
  IN_PROGRESS = "em_andamento",
  FULFILLED = "concluida",
  REJECTED = "recusada",
}
