<template>
  <motion.section
    class="grid gap-5"
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.24, ease: 'easeOut' }"
  >
    <div
      class="grid gap-4 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5 min-[860px]:grid-cols-[minmax(0,1fr)_auto] min-[860px]:items-center"
    >
      <div class="grid max-w-3xl gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_15rem]">
        <AdminSearchField
          v-model="search"
          :is-loading="searchLoading"
          :placeholder="t('admin.games.search')"
        />
        <Select
          v-model="sortMode"
          class="h-12! w-full!"
          option-label="label"
          option-value="value"
          :options="sortOptions"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="stat-pill">
          <VueIcon name="bs:joystick" />
          <span>{{ t('admin.games.count', { count: gamesCount }) }}</span>
        </span>
        <RouterLink
          class="inline-flex h-11 items-center gap-2 rounded-md bg-(--color-primary) px-5 text-sm font-bold text-(--color-on-primary) transition-opacity hover:opacity-90"
          to="/admin/games/new"
        >
          <VueIcon name="bs:plus-circle" />
          <span>{{ t('admin.games.add') }}</span>
        </RouterLink>
      </div>
    </div>

    <PageLoader v-if="isGamesLoading" />
    <RetryState
      v-else-if="loadError"
      :title="t('admin.games.loadErrorTitle')"
      :message="getMessage(loadError.message)"
      :action-label="t('admin.common.retry')"
      @retry="loadPage"
    />
    <AdminGameList
      v-else
      :deleting-game-ids="deletingGameIds"
      :games="sortedGames"
      :has-more="gamesPagination.hasNextPage"
      :is-loading-more="isGamesLoadingMore"
      :load-more-error="loadMoreError"
      :total="gamesPagination.total"
      @delete="requestDeleteGame"
      @edit="openEditGame"
      @load-more="loadMoreGames"
    />

    <AdminGameEditDialog
      :deleting-image-ids="deletingImageIds"
      :game="editingGame"
      :is-loading="isEditLoading"
      :is-reordering="isReordering"
      :is-saving="isSaving"
      :tag-types="tagTypes"
      :visible="editDialogVisible"
      @close="closeEditDialog"
      @delete-image="handleDeleteImage"
      @reorder-images="handleReorderImages"
      @save="handleSaveGame"
    />
  </motion.section>
</template>

<script setup lang="ts">
import {
  AdminGameEditDialog,
  AdminGameList,
  AdminSearchField,
  useAdminCatalog,
  type AdminGame,
  type AdminGameFormPayload,
  type AdminGameListItem,
} from '@/modules/admin'
import { toApiError } from '@/shared/api/error'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { motion } from 'motion-v'
import Select from 'primevue/select'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const {
  deleteGame,
  deleteGameImage,
  deletingGameIds,
  deletingImageIds,
  games,
  gamesCount,
  gamesPagination,
  isGamesLoading,
  isGamesLoadingMore,
  isSaving,
  loadError,
  loadGame,
  loadGames,
  loadTagTypes,
  reorderGameImages,
  tagTypes,
  updateGame,
} = useAdminCatalog()
const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()
const confirm = useConfirm()
const toast = useToast()
const { t } = useI18n()

const search = ref('')
const searchLoading = ref(false)
const sortMode = ref<'updated_desc' | 'created_desc' | 'created_asc'>('updated_desc')
const editDialogVisible = ref(false)
const editingGame = ref<AdminGame | null>(null)
const isEditLoading = ref(false)
const isReordering = ref(false)
const loadMoreError = ref<string | null>(null)
const pageLimit = 20
const scrollLoadThreshold = 420
let searchTimer: ReturnType<typeof setTimeout> | undefined

const sortOptions = computed(() => [
  { label: t('admin.games.sort.updatedDesc'), value: 'updated_desc' },
  { label: t('admin.games.sort.createdDesc'), value: 'created_desc' },
  { label: t('admin.games.sort.createdAsc'), value: 'created_asc' },
])

const getDateTime = (value: string | undefined): number => {
  if (!value) {
    return 0
  }

  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortedGames = computed(() =>
  [...games.value].sort((first, second) => {
    if (sortMode.value === 'created_asc') {
      return getDateTime(first.created_at) - getDateTime(second.created_at)
    }

    if (sortMode.value === 'created_desc') {
      return getDateTime(second.created_at) - getDateTime(first.created_at)
    }

    return (
      getDateTime(second.updated_at ?? second.created_at) -
      getDateTime(first.updated_at ?? first.created_at)
    )
  }),
)

const handleWindowScroll = (): void => {
  if (
    isGamesLoading.value ||
    isGamesLoadingMore.value ||
    loadMoreError.value ||
    !gamesPagination.value.hasNextPage
  ) {
    return
  }

  const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  const scrollPosition = window.scrollY + window.innerHeight

  if (scrollPosition >= documentHeight - scrollLoadThreshold) {
    void loadMoreGames()
  }
}

const queueScrollCheck = (): void => {
  window.requestAnimationFrame(handleWindowScroll)
}

const loadPage = async (): Promise<void> => {
  loadMoreError.value = null

  try {
    await Promise.all([
      loadGames({
        limit: pageLimit,
        page: 1,
        search: search.value.trim() || undefined,
      }),
      loadTagTypes(),
    ])
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    searchLoading.value = false
    queueScrollCheck()
  }
}

const loadMoreGames = async (): Promise<void> => {
  if (isGamesLoading.value || isGamesLoadingMore.value || !gamesPagination.value.hasNextPage) {
    return
  }

  try {
    loadMoreError.value = null
    await loadGames(
      {
        limit: gamesPagination.value.limit || pageLimit,
        page: gamesPagination.value.page + 1,
        search: search.value.trim() || undefined,
      },
      {
        append: true,
      },
    )
    queueScrollCheck()
  } catch (error: unknown) {
    const apiError = toApiError(error)
    loadMoreError.value = getMessage(apiError.message)
    showApiError(apiError)
  }
}

const openEditGame = async (gameId: string): Promise<void> => {
  editDialogVisible.value = true
  editingGame.value = null
  isEditLoading.value = true

  try {
    if (tagTypes.value.length === 0) {
      await loadTagTypes({ silent: true })
    }
    editingGame.value = await loadGame(gameId)
  } catch (error: unknown) {
    showApiError(error)
    editDialogVisible.value = false
  } finally {
    isEditLoading.value = false
  }
}

const closeEditDialog = (): void => {
  editDialogVisible.value = false
  editingGame.value = null
}

const handleSaveGame = async (payload: AdminGameFormPayload): Promise<void> => {
  if (!editingGame.value) {
    return
  }

  try {
    editingGame.value = await updateGame(
      editingGame.value.id,
      {
        description: payload.description,
        price: payload.price,
        tagIds: payload.tagIds,
        title: payload.title,
      },
      payload.images,
    )
    loadMoreError.value = null
    await loadGames({
      limit: gamesPagination.value.limit || pageLimit,
      page: 1,
      search: search.value.trim() || undefined,
    })
    toast.add({ severity: 'success', summary: t('admin.games.toastUpdated'), life: 2600 })
  } catch (error: unknown) {
    showApiError(error)
  }
}

const requestDeleteGame = (game: AdminGameListItem): void => {
  confirm.require({
    accept: () => {
      handleDeleteGame(game.id)
    },
    acceptClass: 'profile-confirm-delete-button',
    acceptIcon: 'pi pi-trash',
    acceptLabel: t('admin.common.delete'),
    defaultFocus: 'reject',
    header: t('admin.games.confirmDelete.title'),
    icon: 'pi pi-exclamation-triangle',
    message: t('admin.games.confirmDelete.message', { title: game.title }),
    rejectClass: 'profile-confirm-cancel-button',
    rejectLabel: t('admin.common.cancel'),
  })
}

const handleDeleteGame = async (gameId: string): Promise<void> => {
  try {
    await deleteGame(gameId)
    toast.add({ severity: 'success', summary: t('admin.games.toastDeleted'), life: 2400 })
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleDeleteImage = async (imageId: string): Promise<void> => {
  if (!editingGame.value) {
    return
  }

  try {
    editingGame.value = await deleteGameImage(editingGame.value.id, imageId)
    toast.add({ severity: 'success', summary: t('admin.games.imageDeleted'), life: 2200 })
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleReorderImages = async (imageIds: string[]): Promise<void> => {
  if (!editingGame.value || isReordering.value) {
    return
  }

  try {
    isReordering.value = true
    editingGame.value = await reorderGameImages(editingGame.value.id, imageIds)
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    isReordering.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  loadPage()
})

watch(search, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchLoading.value = Boolean(value.trim())
  searchTimer = setTimeout(() => {
    loadPage()
  }, 400)
})

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  window.removeEventListener('scroll', handleWindowScroll)
})
</script>

<style scoped>
.stat-pill {
  display: inline-flex;
  height: 2.75rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-high);
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 800;
  color: var(--color-on-surface-variant);
}
</style>
