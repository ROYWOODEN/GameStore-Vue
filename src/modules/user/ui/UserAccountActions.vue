<template>
  <motion.section
    class="min-w-0 overflow-hidden rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-4 text-(--color-on-surface) shadow-sm min-[560px]:p-5"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.32, ease: 'easeOut', delay: 0.26 }"
  >
    <div class="mb-3 flex min-w-0 items-center gap-3 text-(--color-on-surface)">
      <VueIcon name="bs:person-x" />
      <h2 class="min-w-0 text-sm leading-5 font-bold break-words">
        {{ t('profile.account.title') }}
      </h2>
    </div>
    <p class="mb-4 text-sm leading-6 text-(--color-on-surface-variant)">
      {{ t('profile.account.description') }}
    </p>
    <button
      class="inline-flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-4 py-2 text-sm font-bold text-(--color-on-surface-variant) transition-colors hover:border-(--color-error) hover:bg-(--color-menu-danger-hover-bg) hover:text-(--color-error) disabled:cursor-not-allowed disabled:opacity-60 max-[420px]:w-full"
      type="button"
      :disabled="isDeleting"
      @click="handleClick"
    >
      <i v-if="isDeleting" class="pi pi-spin pi-spinner text-base" />
      <VueIcon v-else name="bs:trash" />
      <span>
        {{ isDeleting ? t('profile.account.deleting') : t('profile.account.action') }}
      </span>
    </button>
  </motion.section>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { useI18n } from 'vue-i18n'

defineProps<{
  isDeleting: boolean
}>()

const emit = defineEmits<{
  deleteUser: []
}>()

const { t } = useI18n()

const handleClick = (): void => {
  emit('deleteUser')
}
</script>
