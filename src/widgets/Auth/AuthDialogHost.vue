<template>
  <AuthDialog
    v-model:visible="visible"
    :initial-mode="initialMode"
    :loading="isLoading"
    :error-message="resolvedErrorMessage"
    @login="handleLogin"
    @register="handleRegister"
    @google="handleGoogle"
  />
</template>

<script setup lang="ts">
import type { AuthSession, LoginPayload, RegisterPayload } from '@/modules/auth'
import { useAuth, useAuthDialog } from '@/modules/auth'
import { AuthDialog } from '@/modules/auth'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { computed, watch } from 'vue'

const { initialMode, closeAuthDialog, visible } = useAuthDialog()
const { clearError, continueWithGoogle, authError, isLoading, login, register } = useAuth()
const { getMessage } = useI18nMessage()

const resolvedErrorMessage = computed(() => {
  if (!authError.value) {
    return null
  }

  return getMessage(authError.value.message)
})

const runAndClose = async (
  action: () => Promise<AuthSession | void>,
): Promise<AuthSession | void> => {
  try {
    const result = await action()
    closeAuthDialog()
    return result
  } catch {
    return
  }
}

const handleLogin = async (payload: LoginPayload): Promise<void> => {
  const session = await runAndClose(() => login(payload))
}

const handleRegister = async (payload: RegisterPayload): Promise<void> => {
  const session = await runAndClose(() => register(payload))
}

const handleGoogle = async (): Promise<void> => {
  await runAndClose(continueWithGoogle)
}

watch(visible, (isVisible) => {
  if (isVisible) {
    clearError()
  }
})
</script>
