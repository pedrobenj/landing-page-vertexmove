/** Próxima `ordem` para um item novo: uma depois da maior existente (1 se a lista estiver vazia). */
export function getNextOrder(items: ReadonlyArray<{ ordem: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.ordem), 0) + 1
}
