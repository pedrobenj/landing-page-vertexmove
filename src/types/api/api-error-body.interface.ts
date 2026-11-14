/** Corpo de erro da API: `{ error: { codigo, mensagem, detalhes? } }`. */
export interface ApiErrorBody {
  error: {
    codigo: string
    mensagem: string
    /** 422 `DADO_INVALIDO` do backend: um item por campo recusado (sem o valor enviado). */
    detalhes?: { campo: string; regra: string }[]
  }
}
