<template>
  <motion.section
    class="grid gap-5"
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.24, ease: 'easeOut' }"
  >
    <div
      class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5"
    >
      <div class="grid gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-2xl font-extrabold text-(--color-on-surface)">
              {{ t('admin.tags.pageTitle') }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-(--color-on-surface-variant)">
              {{ t('admin.tags.pageDescription') }}
            </p>
          </div>
          <button
            class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-5 text-sm font-bold text-(--color-on-surface-variant) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
            type="button"
            :disabled="isTagsLoading"
            @click="loadPage(currentPage)"
          >
            <i v-if="isTagsLoading" class="pi pi-spin pi-spinner" />
            <VueIcon v-else name="bs:arrow-clockwise" />
            <span>{{ t('admin.tags.refresh') }}</span>
          </button>
        </div>

        <div class="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_18rem]">
          <AdminSearchField
            v-model="search"
            :is-loading="searchLoading"
            :placeholder="t('admin.tags.search')"
          />
          <Select
            v-model="selectedTypeId"
            class="h-12! w-full!"
            option-label="label"
            option-value="id"
            :options="typeFilterOptions"
            :placeholder="t('admin.tags.allTypes')"
          />
        </div>
      </div>
    </div>

    <PageLoader v-if="isTagsLoading" />
    <RetryState
      v-else-if="loadError"
      :title="t('admin.tags.loadErrorTitle')"
      :message="getMessage(loadError.message)"
      :action-label="t('admin.common.retry')"
      @retry="loadPage"
    />
    <template v-else>
      <AdminTagBoard
        :deleting-tag-ids="deletingTagIds"
        :is-saving="isSaving"
        :tags="tags"
        :tag-types="tagTypes"
        @create="handleCreateTag"
        @delete="requestDeleteTag"
        @update="handleUpdateTag"
      />

      <Paginator
        v-if="tagsPagination.total > tagsPagination.limit"
        :first="(tagsPagination.page - 1) * tagsPagination.limit"
        :rows="tagsPagination.limit"
        :total-records="tagsPagination.total"
        :rows-per-page-options="[10, 20, 50, 100]"
        :current-page-report-template="`{first}-{last} ${t('admin.paginationOf')} {totalRecords}`"
        template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        @page="handlePageChange"
      />
    </template>
  </motion.section>
</template>

<script setup lang="ts">
import {
  AdminTagBoard,
  AdminSearchField,
  getTagTypeLabelKey,
  useAdminCatalog,
  type AdminTagPayload,
} from '@/modules/admin'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { motion } from 'motion-v'
import Paginator, { type PageState } from 'primevue/paginator'
import Select from 'primevue/select'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const {
  createTag,
  deleteTag,
  deletingTagIds,
  isSaving,
  isTagsLoading,
  loadError,
  loadTags,
  loadTagTypes,
  tags,
  tagsPagination,
  tagTypes,
  updateTag,
} = useAdminCatalog()
const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()
const confirm = useConfirm()
const toast = useToast()
const { t } = useI18n()
const search = ref('')
const searchLoading = ref(false)
const selectedTypeId = ref<string | null>(null)
const currentPage = ref(1)
const currentLimit = ref(20)
let searchTimer: ReturnType<typeof setTimeout> | undefined

const typeFilterOptions = computed(() => [
  { id: null, label: t('admin.tags.allTypes') },
  ...tagTypes.value.map((type) => ({
    id: type.id,
    label: `${t(getTagTypeLabelKey(type.name))} (${type.name})`,
  })),
])

const loadPage = async (page = 1): Promise<void> => {
  try {
    currentPage.value = page

    if (tagTypes.value.length === 0) {
      await loadTagTypes()
    }

    await loadTags({
      limit: currentLimit.value,
      page,
      search: search.value.trim() || undefined,
      typeId: selectedTypeId.value || undefined,
    })
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    searchLoading.value = false
  }
}

const resetAndLoad = (): void => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchLoading.value = Boolean(search.value.trim())
  searchTimer = setTimeout(() => {
    loadPage(1)
  }, 350)
}

const handlePageChange = (event: PageState): void => {
  currentLimit.value = event.rows
  loadPage(event.page + 1)
}

const handleCreateTag = async (payload: AdminTagPayload): Promise<void> => {
  try {
    await createTag(payload)
    await loadPage(1)
    toast.add({ severity: 'success', summary: t('admin.tags.toastCreated'), life: 2400 })
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleUpdateTag = async (id: string, payload: AdminTagPayload): Promise<void> => {
  try {
    await updateTag(id, payload)
    await loadPage(currentPage.value)
    toast.add({ severity: 'success', summary: t('admin.tags.toastUpdated'), life: 2400 })
  } catch (error: unknown) {
    showApiError(error)
  }
}

const requestDeleteTag = (id: string): void => {
  confirm.require({
    accept: () => {
      handleDeleteTag(id)
    },
    acceptClass: 'profile-confirm-delete-button',
    acceptIcon: 'pi pi-trash',
    acceptLabel: t('admin.common.delete'),
    defaultFocus: 'reject',
    header: t('admin.tags.confirmDelete.title'),
    icon: 'pi pi-exclamation-triangle',
    message: t('admin.tags.confirmDelete.message'),
    rejectClass: 'profile-confirm-cancel-button',
    rejectLabel: t('admin.common.cancel'),
  })
}

const handleDeleteTag = async (id: string): Promise<void> => {
  try {
    await deleteTag(id)
    await loadPage(currentPage.value)
    toast.add({ severity: 'success', summary: t('admin.tags.toastDeleted'), life: 2400 })
  } catch (error: unknown) {
    showApiError(error)
  }
}

onMounted(() => {
  loadPage()
})

watch([search, selectedTypeId], resetAndLoad)

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>
