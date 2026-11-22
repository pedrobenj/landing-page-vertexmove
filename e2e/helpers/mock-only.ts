/**
 * Marca testes que dependem do seed do mock (dados de demonstração, contagens fixas). O config do backend
 * real (`playwright.real.config.ts`) os exclui com `grepInvert: /@mock/`.
 */
export const MOCK_ONLY = { tag: "@mock" }
