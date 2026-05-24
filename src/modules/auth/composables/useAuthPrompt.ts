import { storeToRefs } from 'pinia'
import { useAuthPromptStore } from '../stores/auth-prompt.store'

export const useAuthPrompt = () => {
  const authPromptStore = useAuthPromptStore()
  const {
    promptId,
    promptMode,
    promptToastDetailKey,
    promptToastSummaryKey,
    shouldShowPromptToast,
  } = storeToRefs(authPromptStore)

  return {
    promptId,
    promptMode,
    promptToastDetailKey,
    promptToastSummaryKey,
    requestAuthPrompt: authPromptStore.requestAuthPrompt,
    shouldShowPromptToast,
  }
}
