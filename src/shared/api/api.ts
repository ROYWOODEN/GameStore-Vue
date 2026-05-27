export type ApiResponse<TData, TDetails = null> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse<TDetails>

export interface ApiSuccessResponse<TData> {
  success: true
  data: TData
  meta?: ApiMeta
  error?: never
}

export interface ApiErrorResponse<TDetails = null> {
  success: false
  data?: never
  meta?: ApiMeta
  error: ApiError<TDetails>
}

export interface ApiError<TDetails = null> {
  statusCode: number
  statusText: string
  type: string
  message: string
  details: TDetails | null
}
export interface ApiMeta {
  count: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  limit?: number
  page?: number
  total?: number
  totalAmount?: string
  totalPages?: number
}
