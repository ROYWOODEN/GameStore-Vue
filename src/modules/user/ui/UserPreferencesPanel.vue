<template>
  <motion.section
    class="min-w-0 overflow-hidden rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-4 text-(--color-on-surface) shadow-sm min-[560px]:p-6"
    :initial="{ opacity: 0, x: 22 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ duration: 0.34, ease: 'easeOut', delay: 0.16 }"
  >
    <div class="mb-5 flex min-w-0 items-center gap-4">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-xl text-(--color-primary)"
      >
        <VueIcon name="bs:sliders" />
      </span>
      <h2 class="min-w-0 text-2xl leading-tight font-bold break-words">
        {{ t('profile.preferences.title') }}
      </h2>
    </div>

    <div class="grid gap-5">
      <label class="grid min-w-0 gap-2">
        <span
          class="text-xs leading-5 font-semibold break-words text-(--color-on-surface-variant) uppercase"
        >
          {{ t('profile.preferences.language') }}
        </span>
        <select
          class="h-12 cursor-pointer rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-4 text-sm text-(--color-on-surface) outline-none transition-colors focus:border-(--color-primary)"
          :value="locale"
          @change="handleLocaleChange"
        >
          <option value="en">{{ t('settings.language.en') }}</option>
          <option value="ru">{{ t('settings.language.ru') }}</option>
        </select>
      </label>

      <div
        class="flex min-w-0 flex-col items-start gap-4 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between"
      >
        <span class="min-w-0">
          <span class="block text-sm leading-5 font-bold break-words">
            {{ t('profile.preferences.theme') }}
          </span>
          <span class="mt-1 block text-xs leading-5 break-words text-(--color-on-surface-variant)">
            {{
              theme === 'dark'
                ? t('profile.preferences.darkActive')
                : t('profile.preferences.lightActive')
            }}
          </span>
        </span>
        <button
          class="flex h-10 w-20 cursor-pointer items-center justify-between rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-highest) p-1 text-(--color-on-surface-variant)"
          type="button"
          :aria-label="t('profile.preferences.toggleTheme')"
          @click="emit('toggleTheme')"
        >
          <span
            :class="[
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              theme === 'light'
                ? 'bg-(--color-menu-active-bg) text-(--color-primary)'
                : 'text-(--color-on-surface-variant)',
            ]"
          >
            <VueIcon name="bs:sun" />
          </span>
          <span
            :class="[
              'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
              theme === 'dark'
                ? 'bg-(--color-menu-active-bg) text-(--color-primary)'
                : 'text-(--color-on-surface-variant)',
            ]"
          >
            <VueIcon name="bs:moon-stars" />
          </span>
        </button>
      </div>
    </div>
  </motion.section>
</template>

<script setup lang="ts">
import type { AppLocale } from '@/app/i18n'
import type { AppTheme } from '@/app/theme/useAppTheme'
import { motion } from 'motion-v'
import { useI18n } from 'vue-i18n'

defineProps<{
  locale: AppLocale
  theme: AppTheme
}>()

const emit = defineEmits<{
  localeChange: [locale: AppLocale]
  toggleTheme: []
}>()

const { t } = useI18n()

const handleLocaleChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement
  emit('localeChange', target.value as AppLocale)
}
</script>
