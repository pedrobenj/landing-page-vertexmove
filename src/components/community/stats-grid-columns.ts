/** Quatro colunas no desktop só com 4+ números; com menos, a faixa fica centralizada e mais estreita. */
export function statsGridColumns(count: number): string {
  return count >= 4 ? "lg:grid-cols-4" : "mx-auto w-full max-w-xl"
}
