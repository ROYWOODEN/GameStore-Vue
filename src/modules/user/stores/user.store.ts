import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchCurrentUser } from '../api/user.api'
import type { User } from '../types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const loadCurrentUserPromise = ref<Promise<User> | null>(null)
  const hasCurrentUser = computed(() => Boolean(user.value))

  const setCurrentUser = (nextUser: User): void => {
    user.value = nextUser
  }

  const clearCurrentUser = (): void => {
    user.value = null
  }

  const loadCurrentUser = async (): Promise<User> => {
    if (user.value) {
      return user.value
    }

    if (loadCurrentUserPromise.value) {
      return await loadCurrentUserPromise.value
    }

    loadCurrentUserPromise.value = (async (): Promise<User> => {
      const currentUser = await fetchCurrentUser()
      setCurrentUser(currentUser)
      return currentUser
    })().finally(() => {
      loadCurrentUserPromise.value = null
    })

    return await loadCurrentUserPromise.value
  }

  return { user, hasCurrentUser, loadCurrentUser, setCurrentUser, clearCurrentUser }
})
