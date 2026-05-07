import { createI18n } from 'vue-i18n'

import { messages } from './locales'

export const supportedLocales = ['ru', 'en'] as const

export type AppLocale = (typeof supportedLocales)[number]

const defaultLocale: AppLocale = 'en'

const isAppLocale = (locale: string | null): locale is AppLocale => {
  return supportedLocales.includes(locale as AppLocale)
}

const getInitialLocale = (): AppLocale => {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const savedLocale = window.localStorage.getItem('locale')

  if (isAppLocale(savedLocale)) {
    return savedLocale
  }

  const browserLocale = window.navigator.language.split('-')[0] ?? defaultLocale

  if (isAppLocale(browserLocale)) {
    return browserLocale
  }

  return defaultLocale
}

const initialLocale = getInitialLocale()

export const i18n = createI18n({
  fallbackLocale: 'en',
  legacy: false,
  locale: initialLocale,
  messages,
})

export const setLocale = (locale: AppLocale) => {
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  window.localStorage.setItem('locale', locale)
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLocale
}
