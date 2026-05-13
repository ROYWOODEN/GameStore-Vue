import { useI18n } from 'vue-i18n'

export const useI18nMessage = () => {
  const { t, te } = useI18n()

  const getMessage = (message: string): string => {
    return te(message) ? t(message) : message
  }

  return { getMessage }
}
