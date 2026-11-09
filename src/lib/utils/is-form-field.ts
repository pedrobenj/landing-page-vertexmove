import type { FieldPath, FieldValues } from "react-hook-form"

/**
 * `true` se `field` (ex.: `"slug"` ou `"fotos.0.url"`) aponta para um campo do formulário — confere a chave
 * de primeiro nível nos `defaultValues`. Usado no `setError` com o campo vindo da API.
 */
export function isFormField<T extends FieldValues>(defaults: T, field: string): field is FieldPath<T> {
  const [root] = field.split(".")
  return root !== "" && Object.hasOwn(defaults, root)
}
