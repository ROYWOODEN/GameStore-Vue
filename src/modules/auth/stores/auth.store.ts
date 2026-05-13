import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { AuthSession } from '../types/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  const setAccessToken = (token: string | null): void => {
    accessToken.value = token
  }

  const setSession = (session: AuthSession): void => {
    accessToken.value = session.accessToken
  }

  const clearSession = (): void => {
    accessToken.value = null
  }

  return {
    accessToken,
    clearSession,
    isAuthenticated,
    setAccessToken,
    setSession,
  }
})
