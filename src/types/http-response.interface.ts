export interface HttpResponse<T = unknown> {
  status: number
  data?: T
  error?: string
  title?: string
}
