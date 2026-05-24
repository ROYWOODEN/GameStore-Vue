import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuthMode } from '../types/auth'

interface AuthPromptOptions {
  detailKey?: string
  mode?: AuthMode
  showToast?: boolean
  summaryKey?: string
}

const DEFAULT_PROMPT_DETAIL_KEY = 'authPrompt.loginRequiredDescription'
const DEFAULT_PROMPT_SUMMARY_KEY = 'authPrompt.loginRequiredTitle'

export const useAuthPromptStore = defineStore('authPrompt', () => {
  const promptId = ref(0)
  const promptMode = ref<AuthMode>('login')
  const promptToastDetailKey = ref(DEFAULT_PROMPT_DETAIL_KEY)
  const promptToastSummaryKey = ref(DEFAULT_PROMPT_SUMMARY_KEY)
  const shouldShowPromptToast = ref(true)

  const requestAuthPrompt = (options: AuthPromptOptions = {}): void => {
    promptMode.value = options.mode ?? 'login'
    promptToastDetailKey.value = options.detailKey ?? DEFAULT_PROMPT_DETAIL_KEY
    promptToastSummaryKey.value = options.summaryKey ?? DEFAULT_PROMPT_SUMMARY_KEY
    shouldShowPromptToast.value = options.showToast ?? true
    promptId.value += 1
  }

  return {
    promptId,
    promptMode,
    promptToastDetailKey,
    promptToastSummaryKey,
    requestAuthPrompt,
    shouldShowPromptToast,
  }
})
