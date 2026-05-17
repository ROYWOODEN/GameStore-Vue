import type { ApiError } from '@/shared/api/api'
import { toApiError } from '@/shared/api/error'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchLogin, fetchLogout, fetchRefresh, fetchRegister } from '../api/auth.api'
import { useAuthStore } from '../stores/auth.store'
import type { AuthSession, LoginPayload, OAuthProvider, RegisterPayload } from '../types/auth'

export const useAuth = () => {
  const router = useRouter()
  const authStore = useAuthStore()
  const { accessToken, isAuthenticated, isSessionInitialized } = storeToRefs(authStore)

  const isLoading = ref(false)
  const authError = ref<ApiError | null>(null)

  const runAuthAction = async <T>(action: () => Promise<T>): Promise<T> => {
    try {
      isLoading.value = true
      authError.value = null
      return await action()
    } catch (error: unknown) {
      const apiError = toApiError(error)
      authError.value = apiError
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  const login = async (payload: LoginPayload): Promise<AuthSession> => {
    return await runAuthAction(async (): Promise<AuthSession> => {
      const session = await fetchLogin(payload)
      authStore.setAccessToken(session.accessToken)
      return session
    })
  }

  const register = async (payload: RegisterPayload): Promise<AuthSession> => {
    return await runAuthAction(async (): Promise<AuthSession> => {
      const session = await fetchRegister(payload)
      authStore.setAccessToken(session.accessToken)
      return session
    })
  }

  const logout = async (): Promise<void> => {
    await fetchLogout()
    authStore.clearSession()
    router.push('/')
  }
  const refresh = async () => {
    try {
      const session = await fetchRefresh()
      authStore.setAccessToken(session.accessToken)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    }
  }

  const continueWithOAuth = async (provider: OAuthProvider): Promise<void> => {
    await runAuthAction(async () => {
      window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/${provider}`
    })
  }

  const continueWithGoogle = async (): Promise<void> => {
    await continueWithOAuth('google')
  }

  const clearError = (): void => {
    authError.value = null
  }

  return {
    accessToken,
    clearError,
    logout,
    refresh,
    continueWithGoogle,
    continueWithOAuth,
    authError,
    isAuthenticated,
    isSessionInitialized,
    isLoading,
    login,
    markSessionInitialized: authStore.markSessionInitialized,
    register,
    setAccessToken: authStore.setAccessToken,
  }
}
