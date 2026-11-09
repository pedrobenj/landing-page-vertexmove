/** Formato do código de inscrição devolvido pela API: `VX-2026-00000042` (CLAUDE.md §6). */
const REGISTRATION_CODE_PATTERN = /^VX-\d{4}-\d{8}$/

export function isRegistrationCode(value: string): boolean {
  return REGISTRATION_CODE_PATTERN.test(value)
}
