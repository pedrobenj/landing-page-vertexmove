interface ReadOnlyNoticeProps {
  children?: string
}

/** Aviso para o operador (papel só de leitura). */
export function ReadOnlyNotice({ children = "Seu perfil tem acesso somente leitura às corridas." }: ReadOnlyNoticeProps) {
  return <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">{children}</p>
}
