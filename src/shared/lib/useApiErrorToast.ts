import { toApiError } from '@/shared/api/error'
import { useToast } from 'primevue/usetoast'
import { useI18nMessage } from './useI18nMessage'

export const useApiErrorToast = () => {
  const toast = useToast()
  const { getMessage } = useI18nMessage()

  const showApiError = (error: unknown): void => {
    const apiError = toApiError(error)
    toast.add({
      severity: 'error',
      summary: getMessage(`errors.types.${apiError.type}`),
      detail: getMessage(apiError.message),
      life: 3000,
    })
  }

  return { showApiError }
}
