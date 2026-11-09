/** "https://www.instagram.com/vertex.corrida/" → "@vertex.corrida". Aceita também "@perfil" ou "perfil". */
export function formatInstagramHandle(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  const withoutHost = trimmed.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "")
  const handle = withoutHost.split(/[/?#]/)[0]?.replace(/^@/, "") ?? ""
  return handle ? `@${handle}` : ""
}
