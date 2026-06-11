<template>
  <div ref="rootRef" class="group relative min-w-0 shrink-0">
    <FloatLabel variant="on">
      <IconField>
        <InputIcon
          :class="[
            isPreviewLoading ? 'pi pi-spin pi-spinner' : 'pi pi-search',
            'text-lg! leading-none! text-(--color-search-icon)! transition-colors group-focus-within:text-(--color-primary)!',
          ]"
        />
        <InputText
          id="header_game_search"
          v-model="search"
          autocomplete="off"
          class="w-full rounded-[1.25rem]! border-2!"
          @focus="isFocused = true"
          @keydown.down.prevent="focusAdvancedLink"
          @keydown.enter.prevent="openAdvancedSearch"
          @keydown.esc.prevent="closePanel"
        />
      </IconField>
      <label
        class="ml-0 max-w-[calc(100%-3rem)] truncate text-sm! font-normal! text-(--color-search-icon)! transition-colors group-focus-within:text-(--color-primary)!"
        for="header_game_search"
      >
        {{ t('header.searchLabel') }}
      </label>
    </FloatLabel>

    <AnimatePresence>
      <motion.div
        v-if="isPanelVisible"
        class="absolute top-[calc(100%+0.75rem)] left-0 z-50 w-full min-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-lowest) shadow-[0_20px_55px_rgb(0_0_0/0.26)] min-[640px]:w-[min(28rem,calc(100vw-2rem))]"
        :initial="{ opacity: 0, y: -8, scale: 0.98 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, y: -8, scale: 0.98 }"
        :transition="{ duration: 0.18, ease: 'easeOut' }"
      >
        <div class="max-h-[25rem] overflow-y-auto p-2">
          <div
            v-if="!hasEnoughQuery"
            class="flex min-h-24 items-center gap-3 rounded-md bg-(--color-surface-container) p-4 text-sm text-(--color-on-surface-variant)"
          >
            <VueIcon name="bs:search" class="text-xl text-(--color-primary)" />
            <span>{{ t('search.quick.hint') }}</span>
          </div>

          <div
            v-else-if="isPreviewLoading"
            class="flex min-h-24 items-center justify-center text-(--color-primary)"
          >
            <i class="pi pi-spin pi-spinner text-2xl" />
          </div>

          <div
            v-else-if="previewError"
            class="grid gap-3 rounded-md bg-(--color-surface-container) p-4"
            role="alert"
          >
            <div class="flex items-center gap-2 text-sm font-bold text-(--color-error)">
              <i class="pi pi-exclamation-triangle" />
              <span>{{ getMessage(previewError.message) }}</span>
            </div>
            <Button
              class="w-fit"
              icon="pi pi-refresh"
              severity="secondary"
              size="small"
              :label="t('search.quick.retry')"
              @click="loadPreviewGames"
            />
          </div>

          <div v-else-if="previewGames.length > 0" class="grid gap-1">
            <GameSearchPreviewCard
              v-for="game in previewGames"
              :key="game.id"
              :game="game"
              :is-owned="libraryIdSet.has(game.id)"
              @select="closePanel"
            />
          </div>

          <div
            v-else
            class="flex min-h-24 items-center gap-3 rounded-md bg-(--color-surface-container) p-4 text-sm text-(--color-on-surface-variant)"
          >
            <VueIcon name="bs:emoji-neutral" class="text-xl text-(--color-primary)" />
            <span>{{ t('search.quick.empty') }}</span>
          </div>
        </div>

        <div
          class="flex items-center justify-between gap-3 border-t border-(--color-outline-variant) bg-(--color-surface-container) px-3 py-2.5"
        >
          <span class="truncate text-xs font-semibold text-(--color-on-surface-variant)">
            {{ t('search.quick.advancedHint') }}
          </span>
          <button
            ref="advancedButtonRef"
            class="inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-3 text-xs font-extrabold text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            type="button"
            @click="openAdvancedSearch"
          >
            <VueIcon name="bs:sliders" />
            <span>{{ t('search.quick.advanced') }}</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<script setup lang="ts">
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { useAuth } from '@/modules/auth'
import { useLibrary } from '@/modules/library'
import { toApiError } from '@/shared/api/error'
import { onClickOutside } from '@vueuse/core'
import { AnimatePresence, motion } from 'motion-v'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { fetchGamesPage } from '../api/games.api'
import type { GameListItem } from '../types/game'
import GameSearchPreviewCard from './GameSearchPreviewCard.vue'

const { t } = useI18n()
const { getMessage } = useI18nMessage()
const router = useRouter()
const { isAuthenticated, isSessionInitialized } = useAuth()
const { getLibraryIds, hasLibraryIdsLoaded, isLibraryIdsLoading, libraryIds } = useLibrary()

const rootRef = ref<HTMLElement | null>(null)
const advancedButtonRef = ref<HTMLButtonElement | null>(null)
const search = ref('')
const isFocused = ref(false)
const isPreviewLoading = ref(false)
const previewGames = ref<GameListItem[]>([])
const previewError = ref<ReturnType<typeof toApiError> | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let requestId = 0

const trimmedSearch = computed(() => search.value.trim())
const hasEnoughQuery = computed(() => trimmedSearch.value.length >= 2)
const isPanelVisible = computed(() => isFocused.value && Boolean(search.value.trim()))
const libraryIdSet = computed(() => new Set(libraryIds.value))

const closePanel = (): void => {
  isFocused.value = false
}

const focusAdvancedLink = (): void => {
  advancedButtonRef.value?.focus()
}

const loadPreviewGames = async (): Promise<void> => {
  if (!hasEnoughQuery.value) {
    previewGames.value = []
    previewError.value = null
    isPreviewLoading.value = false
    return
  }

  const currentRequestId = ++requestId

  try {
    isPreviewLoading.value = true
    previewError.value = null
    const result = await fetchGamesPage({
      limit: 5,
      page: 1,
      search: trimmedSearch.value,
    })

    if (currentRequestId !== requestId) {
      return
    }

    previewGames.value = result.data
  } catch (error: unknown) {
    if (currentRequestId !== requestId) {
      return
    }
    previewError.value = toApiError(error)
  } finally {
    if (currentRequestId === requestId) {
      isPreviewLoading.value = false
    }
  }
}

const loadLibraryIdsIfNeeded = async (): Promise<void> => {
  if (!isSessionInitialized.value || !isAuthenticated.value) {
    return
  }

  if (hasLibraryIdsLoaded.value || isLibraryIdsLoading.value) {
    return
  }

  await getLibraryIds()
}

const openAdvancedSearch = (): void => {
  const query = trimmedSearch.value ? { q: trimmedSearch.value } : undefined
  closePanel()
  router.push({ name: 'search', query })
}

watch(search, () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!hasEnoughQuery.value) {
    previewGames.value = []
    previewError.value = null
    isPreviewLoading.value = false
    return
  }

  isPreviewLoading.value = true
  searchTimer = setTimeout(() => {
    loadPreviewGames()
  }, 320)
})

watch(
  [isSessionInitialized, isAuthenticated],
  () => {
    loadLibraryIdsIfNeeded().catch(() => {})
  },
  { immediate: true },
)

onClickOutside(rootRef, closePanel)

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>
