import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchRefresh } from '../api/auth.api'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const isSessionInitialized = ref(false)
  const refreshSessionPromise = ref<Promise<boolean> | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  const setAccessToken = (token: string | null): void => {
    accessToken.value = token
  }

  const clearSession = (): void => {
    accessToken.value = null
  }

  const markSessionInitialized = (): void => {
    isSessionInitialized.value = true
  }

  const refreshSession = async (): Promise<boolean> => {
    if (refreshSessionPromise.value) {
      return await refreshSessionPromise.value
    }

    refreshSessionPromise.value = (async (): Promise<boolean> => {
      try {
        const session = await fetchRefresh()
        if (!session.accessToken) {
          clearSession()
          return false
        }

        setAccessToken(session.accessToken)
        return true
      } catch (error: unknown) {
        clearSession()
        throw error
      }
    })().finally(() => {
      refreshSessionPromise.value = null
    })

    return await refreshSessionPromise.value
  }

  return {
    accessToken,
    clearSession,
    isAuthenticated,
    isSessionInitialized,
    markSessionInitialized,
    refreshSession,
    setAccessToken,
  }
})
