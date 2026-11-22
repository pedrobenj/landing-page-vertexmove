interface AdminInfoRowProps {
  label: string
  value: string
}

/** Par rótulo/valor de uma `<dl>` nos detalhes do admin (pedido, inscrição). */
export function AdminInfoRow({ label, value }: AdminInfoRowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-all sm:text-right">{value}</dd>
    </div>
  )
}
