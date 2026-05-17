import type { AxiosResponse } from 'axios'
import axios from 'axios'
import type { ApiError, ApiResponse } from './api'

export const apiRequest = async <TData, TDetails = null>(
  request: Promise<AxiosResponse<ApiResponse<TData, TDetails>>>,
): Promise<TData> => {
  try {
    const response = await request
    if (response.status === 204) {
      return undefined as TData
    }

    const body = response.data
    if (body?.success === true) {
      return body.data
    }

    if (body?.success === false) {
      throw body.error
    }

    throw {
      statusCode: response.status,
      statusText: response.statusText,
      type: 'UnknownError',
      message: 'errors.internal',
      details: null,
    } satisfies ApiError
  } catch (error) {
    if (axios.isAxiosError<ApiResponse<never, TDetails>>(error)) {
      const body = error.response?.data

      if (body?.success === false) {
        throw body.error
      }

      throw {
        statusCode: error.response?.status ?? 0,
        statusText: error.response?.statusText ?? 'Network Error',
        type: 'NetworkError',
        message: 'errors.network',
        details: null,
      } satisfies ApiError
    }
    throw error
  }
}
