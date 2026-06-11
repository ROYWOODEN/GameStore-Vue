import { useAuthPromptStore } from '@/modules/auth/stores/auth-prompt.store'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useUserStore } from '@/modules/user/stores/user.store'
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let hasRequestedExpiredSessionPrompt = false

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const isRefreshRequest = (url: string | undefined): boolean => {
  return Boolean(url?.includes('/auth/refresh'))
}

const getAuthorizationHeader = (config: RetriableRequestConfig): unknown => {
  if (typeof config.headers.get === 'function') {
    return config.headers.get('Authorization')
  }

  return config.headers.Authorization ?? config.headers.authorization
}

const clearExpiredSession = (): void => {
  const authStore = useAuthStore()
  const authPromptStore = useAuthPromptStore()
  const userStore = useUserStore()

  authStore.clearSession()
  userStore.clearCurrentUser()

  if (hasRequestedExpiredSessionPrompt) {
    return
  }

  hasRequestedExpiredSessionPrompt = true
  authPromptStore.requestAuthPrompt()
}

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (isRefreshRequest(config.url)) {
    config.headers.delete('Authorization')
  } else if (authStore.accessToken) {
    hasRequestedExpiredSessionPrompt = false
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  } else {
    config.headers.delete('Authorization')
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshRequest(originalRequest.url) ||
      !getAuthorizationHeader(originalRequest)
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const authStore = useAuthStore()
      const hasSession = await authStore.refreshSession()

      if (!hasSession) {
        clearExpiredSession()
        return Promise.reject(error)
      }

      hasRequestedExpiredSessionPrompt = false
      return api(originalRequest)
    } catch {
      clearExpiredSession()
      return Promise.reject(error)
    }
  },
)
