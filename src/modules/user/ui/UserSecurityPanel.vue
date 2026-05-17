<template>
  <motion.section
    class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-6 text-(--color-on-surface) shadow-sm"
    :initial="{ opacity: 0, x: 22 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ duration: 0.34, ease: 'easeOut', delay: 0.1 }"
  >
    <div class="mb-5 flex items-center gap-4">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-xl text-(--color-primary)"
      >
        <VueIcon name="bs:shield-lock" />
      </span>
      <h2 class="text-2xl font-bold">{{ t('profile.security.title') }}</h2>
    </div>

    <button
      class="flex w-full cursor-pointer items-center justify-between gap-4 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-4 text-left transition-colors hover:border-(--color-primary)"
      type="button"
      @click="emit('google')"
    >
      <span class="min-w-0">
        <span class="block text-sm font-bold">{{ t('profile.security.googleTitle') }}</span>
        <span class="mt-1 block truncate text-xs text-(--color-on-surface-variant)">
          {{ t('profile.security.googleSubtitle') }}
        </span>
      </span>
      <i class="pi pi-google shrink-0 text-lg text-(--color-primary)" />
    </button>
  </motion.section>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  google: []
}>()

const { t } = useI18n()
</script>
