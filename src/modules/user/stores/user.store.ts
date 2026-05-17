import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '../types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const hasCurrentUser = computed(() => Boolean(user.value))

  const setCurrentUser = (responseUser: User): void => {
    user.value = responseUser
  }
  const clearCurrentUser = (): void => {
    user.value = null
  }

  return { user, hasCurrentUser, setCurrentUser, clearCurrentUser }
})
