import type { REGISTRATION_STATUS } from "@/enums/registration-status.enum"

/** Corpo de `POST /inscricoes/comprovante` (contrato PROPOSTO ao backend, §16). */
export interface RegistrationReceiptInput {
  /** Referência opaca devolvida em cada item da consulta (`RegistrationLookupItem.referencia`). */
  referencia: string
  dataNascimento: string // YYYY-MM-DD — confirma que é o próprio atleta
}

/**
 * Resposta de `POST /inscricoes/comprovante`: dados para ver e baixar o comprovante. Só sai depois de o atleta
 * confirmar a data de nascimento; o CPF vem mascarado.
 */
export interface RegistrationReceipt {
  codigo: string
  status: REGISTRATION_STATUS
  nomeCompleto: string
  cpfMascarado: string | null
  evento: {
    nome: string
    dataEvento: string // YYYY-MM-DD
    horarioLargada: string // HH:mm
    localizacaoResumo: string
  }
  distancia: string
  kit: string | null
  tamanhoCamisa: string | null
  valorBaseCentavos: number
  valorDescontoCentavos: number
  valorTotalCentavos: number
  inscritoEm: string // ISO-8601
}

/** PDF do comprovante devolvido pela server action (base64, para o navegador baixar). */
export interface RegistrationReceiptFile {
  fileName: string
  base64: string
}
