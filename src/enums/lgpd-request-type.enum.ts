/** Tipos de solicitação do titular (`TipoSolicitacaoTitular` do módulo LGPD do backend). */
export enum LGPD_REQUEST_TYPE {
  ACCESS = "acesso",
  CORRECTION = "correcao",
  DELETION = "eliminacao",
  PORTABILITY = "portabilidade",
  CONSENT_REVOCATION = "revogacao_consentimento",
  INFORMATION = "informacao",
}
