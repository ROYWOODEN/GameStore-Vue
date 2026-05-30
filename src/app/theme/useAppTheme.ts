import { useDark, useToggle } from '@vueuse/core'
import { computed } from 'vue'

export type AppTheme = 'light' | 'dark'

const isDark = useDark({
  attribute: 'class',
  selector: 'html',
  storageKey: 'theme',
  valueDark: 'app-dark',
  valueLight: '',
})

const toggleDark = useToggle(isDark)
const theme = computed<AppTheme>(() => (isDark.value ? 'dark' : 'light'))

export const useAppTheme = () => {
  const setTheme = (nextTheme: AppTheme): void => {
    isDark.value = nextTheme === 'dark'
  }

  const toggleTheme = (): void => {
    toggleDark()
  }

  return {
    isDark,
    setTheme,
    theme,
    toggleTheme,
  }
}

