<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <PageLoader v-if="isLibraryLoading" />

    <section v-else-if="libraryItems.length > 0">
      <GameCardGrid
        :games="libraryItems"
        :favorite-ids="favoriteIds"
        :pending-favorite-ids="pendingFavoriteIds"
        force-owned
        @favorite-toggle="handleFavoriteToggle"
      />
    </section>

    <RetryState
      v-else-if="libraryLoadError"
      :title="t('libraryPage.loadErrorTitle')"
      :message="getMessage(libraryLoadError.message)"
      :action-label="t('libraryPage.retry')"
      @retry="handleRetry"
    />

    <section v-else>
      <div
        class="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center gap-3 text-center"
      >
        <div
          class="mb-1 flex h-16 w-16 items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-3xl text-(--color-primary)"
          aria-hidden="true"
        >
          <VueIcon name="co:library" />
        </div>
        <h1 class="text-2xl font-bold text-(--color-on-surface)">
          {{ t('libraryPage.emptyTitle') }}
        </h1>
        <p class="text-sm leading-6 text-(--color-on-surface-variant)">
          {{ t('libraryPage.emptyDescription') }}
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useFavorites, type FavoriteGameId } from '@/modules/favorite'
import { GameCardGrid } from '@/modules/game'
import { useLibrary } from '@/modules/library'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()
const { favoriteIds, getFavoriteIds, pendingFavoriteIds, toggleFavorite } = useFavorites()
const { getLibrary, isLibraryLoading, libraryItems, libraryLoadError } = useLibrary()

const favoriteIdSet = computed(() => new Set(favoriteIds.value))

const loadLibraryPage = async (): Promise<void> => {
  try {
    await Promise.all([getLibrary(), getFavoriteIds()])
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleRetry = (): void => {
  loadLibraryPage()
}

const handleFavoriteToggle = async (game: { id: FavoriteGameId }): Promise<void> => {
  try {
    await toggleFavorite(game.id, favoriteIdSet.value.has(game.id))
  } catch (error: unknown) {
    showApiError(error)
  }
}

onMounted(() => {
  loadLibraryPage()
})
</script>
