import type { PaymentMethod } from "@/generated/prisma/enums"

export interface CreatePixChargeParams {
  registrationCode: string
  amount: number // centavos
  description: string
  payerEmail: string
  payerCpf: string
  expiresAt: Date
}

export interface PixCharge {
  providerPaymentId: string
  qrCodeBase64: string
  copyPaste: string
}

/** Contrato do gateway. Implementação concreta depende da decisão do cliente (CLAUDE.md §15). */
export interface PaymentProvider {
  readonly name: string
  readonly supportedMethods: PaymentMethod[]
  createPixCharge(params: CreatePixChargeParams): Promise<PixCharge>
  verifyWebhookSignature(request: Request, rawBody: string): Promise<boolean>
}
