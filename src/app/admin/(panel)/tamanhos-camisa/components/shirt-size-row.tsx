import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { toShirtSizeFormValues } from "@/lib/utils/shirt-size-form-values"
import type { ShirtSize } from "@/types/api/shirt-size.interface"

import { ShirtSizeFormDialog } from "./shirt-size-form-dialog"

interface ShirtSizeRowProps {
  shirtSize: ShirtSize
  canManage: boolean
}

export function ShirtSizeRow({ shirtSize, canManage }: ShirtSizeRowProps) {
  return (
    <TableRow>
      <TableCell className="font-heading font-bold text-brand-navy">{shirtSize.codigo}</TableCell>
      <TableCell className="hidden whitespace-normal sm:table-cell">{shirtSize.descricao ?? "—"}</TableCell>
      <TableCell className="hidden tabular-nums sm:table-cell">{shirtSize.ordem}</TableCell>
      <TableCell>
        <Badge variant={shirtSize.ativo ? "default" : "outline"}>{shirtSize.ativo ? "Ativo" : "Inativo"}</Badge>
      </TableCell>
      {canManage && (
        <TableCell className="text-right">
          <ShirtSizeFormDialog
            shirtSize={{ id: shirtSize.id, codigo: shirtSize.codigo }}
            defaultValues={toShirtSizeFormValues(shirtSize)}
          />
        </TableCell>
      )}
    </TableRow>
  )
}
