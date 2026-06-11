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
import { useAuth, useAuthDialog, useAuthPrompt } from '@/modules/auth'
import { AuthDialog } from '@/modules/auth'
import { useUser } from '@/modules/user'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { useToast } from 'primevue/usetoast'
import { computed, watch } from 'vue'

const { initialMode, closeAuthDialog, openAuthDialog, visible } = useAuthDialog()
const { clearError, continueWithGoogle, authError, isLoading, login, register } = useAuth()
const { promptId, promptMode, promptToastDetailKey, promptToastSummaryKey, shouldShowPromptToast } =
  useAuthPrompt()
const { setCurrentUser } = useUser()
const { getMessage } = useI18nMessage()
const toast = useToast()

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
  if (!session) {
    return
  }

  setCurrentUser(session.user)
}

const handleRegister = async (payload: RegisterPayload): Promise<void> => {
  const session = await runAndClose(() => register(payload))
  if (!session) {
    return
  }

  setCurrentUser(session.user)
}

const handleGoogle = async (): Promise<void> => {
  await runAndClose(continueWithGoogle)
}

watch(visible, (isVisible) => {
  if (isVisible) {
    clearError()
  }
})

watch(
  promptId,
  (nextPromptId) => {
    if (nextPromptId === 0) {
      return
    }

    openAuthDialog(promptMode.value)

    if (!shouldShowPromptToast.value) {
      return
    }

    toast.add({
      severity: 'warn',
      summary: getMessage(promptToastSummaryKey.value),
      detail: getMessage(promptToastDetailKey.value),
      life: 3000,
    })
  },
  { immediate: true },
)
</script>
