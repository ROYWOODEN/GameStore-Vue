<template>
  <motion.section
    class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-5 text-(--color-on-surface) shadow-sm"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.32, ease: 'easeOut', delay: 0.22 }"
  >
    <div class="mb-3 flex items-center gap-3 text-(--color-primary)">
      <span
        class="flex h-9 w-9 items-center justify-center rounded-md border border-(--color-primary) bg-(--color-surface-container) text-xl"
      >
        <VueIcon name="md:sharp-admin-panel-settings" />
      </span>
      <h2 class="text-sm font-bold">{{ t('profile.admin.title') }}</h2>
    </div>
    <p class="mb-4 text-sm leading-6 text-(--color-on-surface-variant)">
      {{ t('profile.admin.description') }}
    </p>
    <button
      class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md bg-(--color-primary) px-5 text-sm font-bold text-(--color-on-primary) transition-opacity hover:opacity-90"
      type="button"
      @click="openAdminPanel"
    >
      <span>{{ t('profile.admin.action') }}</span>
      <VueIcon name="bs:arrow-right" />
    </button>
  </motion.section>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => void
}

const { t } = useI18n()
const router = useRouter()

const openAdminPanel = (): void => {
  const navigate = () => router.push('/admin/games')
  const transitionDocument = document as ViewTransitionDocument

  if (transitionDocument.startViewTransition) {
    transitionDocument.startViewTransition(navigate)
    return
  }

  navigate()
}
</script>
