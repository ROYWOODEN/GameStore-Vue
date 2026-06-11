<template>
  <section v-if="games.length > 0" class="grid gap-3">
    <AnimatePresence mode="popLayout">
      <motion.div
        v-for="game in games"
        :key="game.id"
        layout="position"
        :initial="{ opacity: 0, y: 18, scale: 0.98 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, x: 28, scale: 0.96 }"
        :transition="{
          layout: { duration: 0.24, ease: 'easeOut' },
          opacity: { duration: 0.18, ease: 'easeOut' },
          x: { duration: 0.18, ease: 'easeOut' },
          y: { duration: 0.2, ease: 'easeOut' },
          scale: { duration: 0.16, ease: 'easeOut' },
        }"
      >
        <AdminGameCard
          :game="game"
          :is-deleting="deletingGameIds.includes(game.id)"
          @delete="emit('delete', $event)"
          @edit="emit('edit', $event)"
        />
      </motion.div>
    </AnimatePresence>

    <div
      class="mt-1 flex flex-wrap items-center justify-between gap-3 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) px-4 py-3"
    >
      <span class="text-xs font-semibold text-(--color-on-surface-variant)">
        {{ t('admin.games.shown', { count: games.length, total }) }}
      </span>

      <div class="flex flex-wrap items-center justify-end gap-3">
        <span
          v-if="isLoadingMore"
          class="inline-flex h-9 items-center gap-2 text-xs font-bold text-(--color-primary)"
        >
          <i class="pi pi-spin pi-spinner" />
          <span>{{ t('admin.games.loadingMore') }}</span>
        </span>

        <span
          v-else-if="loadMoreError"
          class="inline-flex items-center gap-2 text-xs font-semibold text-(--color-error)"
        >
          <i class="pi pi-exclamation-triangle" />
          <span>{{ loadMoreError }}</span>
        </span>

        <span v-else-if="!hasMore" class="text-xs font-semibold text-(--color-on-surface-variant)">
          {{ t('admin.games.allLoaded') }}
        </span>

        <button
          v-if="hasMore || loadMoreError"
          class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-3 text-xs font-bold text-(--color-on-surface-variant) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="isLoadingMore"
          @click="emit('loadMore')"
        >
          <VueIcon :name="loadMoreError ? 'bs:arrow-clockwise' : 'bs:arrow-down'" />
          <span>{{ loadMoreError ? t('admin.common.retry') : t('admin.games.loadMore') }}</span>
        </button>
      </div>
    </div>
  </section>

  <section
    v-else
    class="flex min-h-72 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-(--color-outline-variant) bg-(--color-surface-container) px-6 text-center"
  >
    <span
      class="flex h-12 w-12 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-2xl text-(--color-primary)"
    >
      <VueIcon name="bs:joystick" />
    </span>
    <h2 class="text-xl font-extrabold text-(--color-on-surface)">
      {{ t('admin.games.emptyTitle') }}
    </h2>
    <p class="max-w-md text-sm leading-6 text-(--color-on-surface-variant)">
      {{ t('admin.games.emptyDescription') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { useI18n } from 'vue-i18n'
import type { AdminGameListItem } from '../types/admin'
import AdminGameCard from './AdminGameCard.vue'

withDefaults(
  defineProps<{
    deletingGameIds?: string[]
    games: AdminGameListItem[]
    hasMore?: boolean
    isLoadingMore?: boolean
    loadMoreError?: string | null
    total?: number
  }>(),
  {
    deletingGameIds: () => [],
    hasMore: false,
    isLoadingMore: false,
    loadMoreError: null,
    total: 0,
  },
)

const emit = defineEmits<{
  delete: [game: AdminGameListItem]
  edit: [gameId: string]
  loadMore: []
}>()

const { t } = useI18n()
</script>
