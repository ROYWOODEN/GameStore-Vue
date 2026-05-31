<template>
  <motion.section
    class="min-w-0 overflow-hidden rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-4 text-(--color-on-surface) shadow-sm min-[560px]:p-6"
    :initial="{ opacity: 0, x: 22 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ duration: 0.34, ease: 'easeOut', delay: 0.1 }"
  >
    <div class="mb-5 flex min-w-0 items-center gap-4">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-xl text-(--color-primary)"
      >
        <VueIcon name="bs:shield-lock" />
      </span>
      <h2 class="min-w-0 text-2xl leading-tight font-bold break-words">
        {{ t('profile.security.title') }}
      </h2>
    </div>

    <button
      class="flex w-full min-w-0 cursor-pointer items-center justify-between gap-4 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-4 text-left transition-colors hover:border-(--color-primary)"
      type="button"
      @click="emit('google')"
    >
      <span class="min-w-0">
        <span class="block text-sm leading-5 font-bold break-words">{{
          t('profile.security.googleTitle')
        }}</span>
        <span class="mt-1 block text-xs leading-5 break-words text-(--color-on-surface-variant)">
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
