import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const isSessionInitialized = ref(false)

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

  return {
    accessToken,
    clearSession,
    isAuthenticated,
    isSessionInitialized,
    markSessionInitialized,
    setAccessToken,
  }
})
