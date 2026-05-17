<template>
  <motion.section
    class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-5 text-(--color-on-surface) shadow-sm"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.32, ease: 'easeOut', delay: 0.22 }"
  >
    <div class="mb-3 flex items-center gap-3 text-(--color-primary)">
      <VueIcon name="bs:person-gear" />
      <h2 class="text-sm font-bold">{{ t('profile.admin.title') }}</h2>
    </div>
    <p class="mb-4 text-sm leading-6 text-(--color-on-surface-variant)">
      {{ t('profile.admin.description') }}
    </p>
    <button
      class="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-(--color-on-surface) transition-colors hover:text-(--color-primary)"
      type="button"
    >
      <span>{{ t('profile.admin.action') }}</span>
      <VueIcon name="bs:arrow-right" />
    </button>
  </motion.section>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
