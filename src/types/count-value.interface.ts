/** Número animável extraído de um texto como "3.500+" (prefixo e sufixo preservados). */
export interface CountValue {
  prefix: string
  value: number
  suffix: string
  /** O texto original agrupava milhares com ponto ("3.500"). */
  grouped: boolean
}
