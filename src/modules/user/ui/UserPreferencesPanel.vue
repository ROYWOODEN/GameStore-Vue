<template>
  <motion.section
    class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-6 text-(--color-on-surface) shadow-sm"
    :initial="{ opacity: 0, x: 22 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ duration: 0.34, ease: 'easeOut', delay: 0.16 }"
  >
    <div class="mb-5 flex items-center gap-4">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-xl text-(--color-primary)"
      >
        <VueIcon name="bs:sliders" />
      </span>
      <h2 class="text-2xl font-bold">{{ t('profile.preferences.title') }}</h2>
    </div>

    <div class="grid gap-5">
      <label class="grid gap-2">
        <span class="text-xs font-semibold uppercase text-(--color-on-surface-variant)">
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
        class="flex items-center justify-between gap-4 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-4"
      >
        <span>
          <span class="block text-sm font-bold">
            {{ t('profile.preferences.theme') }}
          </span>
          <span class="mt-1 block text-xs text-(--color-on-surface-variant)">
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
