import { createSharedComposable } from '@vueuse/core'
import { ref } from 'vue'

import type { AuthMode } from '../types/auth'

export const useAuthDialog = createSharedComposable(() => {
  const visible = ref(false)
  const initialMode = ref<AuthMode>('login')

  const openAuthDialog = (mode: AuthMode = 'login'): void => {
    initialMode.value = mode
    visible.value = true
  }

  const closeAuthDialog = (): void => {
    visible.value = false
  }

  return {
    closeAuthDialog,
    initialMode,
    openAuthDialog,
    visible,
  }
})
