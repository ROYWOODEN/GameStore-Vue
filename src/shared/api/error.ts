import type { ApiError } from './api'

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'statusText' in error &&
    'type' in error &&
    'message' in error &&
    'details' in error
  )
}

export const toApiError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error
  }
  return {
    statusCode: 0,
    statusText: 'Unknown Error',
    type: 'UnknownError',
    message: 'errors.internal',
    details: null,
  }
}
