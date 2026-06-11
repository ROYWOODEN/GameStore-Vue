<template>
  <section class="grid gap-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-extrabold text-(--color-on-surface)">
          {{ t('admin.tagSelector.title') }}
        </h2>
        <p class="mt-1 text-xs text-(--color-on-surface-variant)">
          {{ t('admin.tagSelector.description') }}
        </p>
      </div>
      <span
        class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-3 py-1.5 text-xs font-bold text-(--color-on-surface-variant)"
      >
        {{ t('admin.tags.selected', { count: selectedTags.length }) }}
      </span>
    </div>

    <div v-if="displayTagTypes.length > 0" class="grid gap-4">
      <section
        v-for="type in displayTagTypes"
        :key="type.id"
        :class="[
          'rounded-md border bg-(--color-surface-container-low) p-4 transition-colors',
          getTypeError(type) ? 'border-(--color-error)' : 'border-(--color-outline-variant)',
        ]"
      >
        <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-sm font-extrabold text-(--color-on-surface)">
              {{ t(getTagTypeLabelKey(type.name)) }}
            </h3>
            <p class="mt-1 text-xs text-(--color-on-surface-variant)">
              {{ normalizeTagTypeName(type.name) || type.name }} ·
              {{ t(getTagRuleTextKey(type.name)) }}
            </p>
          </div>
          <span class="text-xs font-semibold text-(--color-primary)">
            {{ t('admin.tags.selectedShort', { count: countSelectedByType(type.name) }) }}
          </span>
        </div>

        <AdminSearchField
          :model-value="getTypeState(type).search"
          class="mb-3"
          :is-loading="isTypeLoading(type)"
          :placeholder="t('admin.tags.search')"
          @update:model-value="setSearch(type, $event)"
        />

        <Message
          v-if="getTypeError(type)"
          class="mb-3"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ getTypeError(type) }}
        </Message>

        <div
          v-if="isTypeLoading(type) && getDisplayTags(type).length === 0"
          class="grid min-h-24 place-items-center rounded-md border border-dashed border-(--color-outline-variant) bg-(--color-surface-container)"
        >
          <i class="pi pi-spin pi-spinner text-xl text-(--color-primary)" />
        </div>

        <div
          v-else-if="getDisplayTags(type).length > 0"
          class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
        >
          <button
            v-for="item in getDisplayTags(type)"
            :key="item.id"
            type="button"
            :class="[
              tagRowClass,
              isSelected(item.id)
                ? 'border-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary)'
                : 'border-(--color-outline-variant) bg-(--color-surface-container-high) text-(--color-on-surface) hover:border-(--color-primary) hover:text-(--color-primary)',
            ]"
            @click="toggleTag(type, item)"
          >
            <span
              :class="[
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.72rem] transition-colors',
                isSelected(item.id)
                  ? 'border-(--color-primary) bg-(--color-primary) text-(--color-on-primary)'
                  : 'border-(--color-outline) text-transparent',
              ]"
            >
              <VueIcon name="bs:check-lg" />
            </span>
            <span class="min-w-0 truncate">{{ item.name }}</span>
          </button>
        </div>

        <div
          v-else
          class="rounded-md border border-dashed border-(--color-outline-variant) bg-(--color-surface-container) p-4 text-sm text-(--color-on-surface-variant)"
        >
          {{ t('admin.tags.notFound') }}
        </div>

        <button
          v-if="canCreateTagFromSearch(type)"
          class="mt-3 inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-md border border-(--color-primary) bg-(--color-menu-active-bg) px-4 text-sm font-bold text-(--color-primary) transition-colors hover:bg-(--color-primary) hover:text-(--color-on-primary) disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="getTypeState(type).isCreating"
          @click="createTagFromSearch(type)"
        >
          <i v-if="getTypeState(type).isCreating" class="pi pi-spin pi-spinner" />
          <VueIcon v-else name="bs:plus-circle" />
          <span>
            {{ t('admin.tags.createFromSearch', { name: getTypeState(type).search.trim() }) }}
          </span>
        </button>

        <Message
          v-if="getTypeLoadError(type)"
          class="mt-3"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ getTypeLoadError(type) }}
        </Message>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs text-(--color-on-surface-variant)">
            {{ t('admin.tags.totalFound', { count: getTypeTotal(type) }) }}
          </span>
          <button
            v-if="hasTypeNextPage(type)"
            class="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-3 text-xs font-bold text-(--color-on-surface-variant) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            :disabled="isTypeLoadingMore(type)"
            @click="loadRelatedTypeTags(type, { append: true })"
          >
            <i v-if="isTypeLoadingMore(type)" class="pi pi-spin pi-spinner" />
            <VueIcon v-else name="bs:arrow-down" />
            <span>{{ t('admin.tags.loadMore') }}</span>
          </button>
        </div>
      </section>
    </div>

    <div
      v-else
      class="rounded-md border border-dashed border-(--color-outline-variant) bg-(--color-surface-container-low) p-5 text-sm text-(--color-on-surface-variant)"
    >
      {{ t('admin.tags.typesNotLoaded') }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { fetchAdminCreateTag, fetchAdminTags } from '../api/admin.api'
import {
  getTagRuleTextKey,
  getTagTypeLabelKey,
  isSingleSelectTagType,
  normalizeTagTypeName,
  resolveTagTypeName,
  toAdminTag,
} from '../lib/tags'
import type { AdminTag, AdminTagType } from '../types/admin'
import AdminSearchField from './AdminSearchField.vue'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import { computed, onBeforeUnmount, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type TypeState = {
  error: string | null
  hasNextPage: boolean
  isCreating: boolean
  isLoading: boolean
  isLoadingMore: boolean
  limit: number
  loadedSearch: string
  page: number
  search: string
  tags: AdminTag[]
  total: number
}

const props = withDefaults(
  defineProps<{
    errorsByType?: Record<string, string | null>
    tagTypes: AdminTagType[]
  }>(),
  {
    errorsByType: () => ({}),
  },
)

const selectedTags = defineModel<AdminTag[]>('selectedTags', { required: true })
const { t } = useI18n()
const toast = useToast()
const { showApiError } = useApiErrorToast()

const stateByTypeId = reactive<Record<string, TypeState>>({})
const searchTimers = new Map<string, ReturnType<typeof setTimeout>>()

const sortedTagTypes = computed(() =>
  [...props.tagTypes].sort((first, second) => first.sort_order - second.sort_order),
)

const getNormalizedTypeKey = (type: AdminTagType): string =>
  normalizeTagTypeName(type.name) || type.name

const getTypeWeight = (type: AdminTagType): number =>
  (type.tags?.length ?? 0) + (type.tags_count ?? 0)

const displayTagTypes = computed(() => {
  const typeByNormalizedName = new Map<string, AdminTagType>()

  for (const type of sortedTagTypes.value) {
    const normalizedType = getNormalizedTypeKey(type)
    const currentType = typeByNormalizedName.get(normalizedType)

    if (!currentType || getTypeWeight(type) > getTypeWeight(currentType)) {
      typeByNormalizedName.set(normalizedType, type)
    }
  }

  return [...typeByNormalizedName.values()].sort(
    (first, second) => first.sort_order - second.sort_order,
  )
})

const tagRowClass =
  'flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-md border px-3 text-left text-sm font-bold transition-colors'

const ensureTypeState = (type: AdminTagType): TypeState => {
  if (!stateByTypeId[type.id]) {
    stateByTypeId[type.id] = {
      error: null,
      hasNextPage: false,
      isCreating: false,
      isLoading: false,
      isLoadingMore: false,
      limit: 20,
      loadedSearch: '',
      page: 1,
      search: '',
      tags: (type.tags ?? []).map((tag) => toAdminTag(tag, type)),
      total: type.tags?.length ?? 0,
    }
  }

  return stateByTypeId[type.id] as TypeState
}

const getTypeState = (type: AdminTagType): TypeState => ensureTypeState(type)

const getRelatedTypes = (type: AdminTagType): AdminTagType[] => {
  const normalizedType = getNormalizedTypeKey(type)
  return sortedTagTypes.value.filter((item) => getNormalizedTypeKey(item) === normalizedType)
}

const getRelatedTypeStates = (type: AdminTagType): TypeState[] =>
  getRelatedTypes(type).map((item) => ensureTypeState(item))

const isTypeLoading = (type: AdminTagType): boolean =>
  getRelatedTypeStates(type).some((state) => state.isLoading)

const isTypeLoadingMore = (type: AdminTagType): boolean =>
  getRelatedTypeStates(type).some((state) => state.isLoadingMore)

const hasTypeNextPage = (type: AdminTagType): boolean =>
  getRelatedTypeStates(type).some((state) => state.hasNextPage)

const getTypeTotal = (type: AdminTagType): number =>
  getRelatedTypeStates(type).reduce((total, state) => total + state.total, 0)

const getTypeLoadError = (type: AdminTagType): string | null =>
  getRelatedTypeStates(type).find((state) => state.error)?.error ?? null

const getTypeError = (type: AdminTagType): string | null => {
  return props.errorsByType[normalizeTagTypeName(type.name)] ?? null
}

const countSelectedByType = (typeName: string): number => {
  const normalizedType = normalizeTagTypeName(typeName)
  return selectedTags.value.filter(
    (tag) => resolveTagTypeName(tag, props.tagTypes) === normalizedType,
  ).length
}

const isSelected = (tagId: string): boolean => selectedTags.value.some((tag) => tag.id === tagId)

const getSelectedForType = (type: AdminTagType): AdminTag[] => {
  const normalizedType = normalizeTagTypeName(type.name)
  return selectedTags.value.filter(
    (tag) => resolveTagTypeName(tag, props.tagTypes) === normalizedType,
  )
}

const getDisplayTags = (type: AdminTagType): AdminTag[] => {
  const selected = getSelectedForType(type)
  const selectedIdSet = new Set(selected.map((tag) => tag.id))
  const loadedTagMap = new Map<string, AdminTag>()

  for (const state of getRelatedTypeStates(type)) {
    for (const tag of state.tags) {
      if (!selectedIdSet.has(tag.id)) {
        loadedTagMap.set(tag.id, tag)
      }
    }
  }

  return [...selected, ...loadedTagMap.values()]
}

const canCreateTagFromSearch = (type: AdminTagType): boolean => {
  const state = ensureTypeState(type)
  const search = state.search.trim().toLowerCase()

  if (
    !search ||
    state.loadedSearch !== search ||
    isTypeLoading(type) ||
    isTypeLoadingMore(type) ||
    getTypeTotal(type) > 0
  ) {
    return false
  }

  return !getDisplayTags(type).some((tag) => tag.name.trim().toLowerCase() === search)
}

const setSearch = (type: AdminTagType, value: string): void => {
  const relatedTypes = getRelatedTypes(type)

  for (const relatedType of relatedTypes) {
    ensureTypeState(relatedType).search = value
  }

  const currentTimer = searchTimers.get(type.id)
  if (currentTimer) {
    clearTimeout(currentTimer)
  }

  searchTimers.set(
    type.id,
    setTimeout(() => {
      loadRelatedTypeTags(type)
    }, 350),
  )
}

const clearRelatedSearchTimers = (type: AdminTagType): void => {
  for (const relatedType of getRelatedTypes(type)) {
    const currentTimer = searchTimers.get(relatedType.id)

    if (currentTimer) {
      clearTimeout(currentTimer)
      searchTimers.delete(relatedType.id)
    }
  }
}

const resetRelatedSearch = (type: AdminTagType): void => {
  for (const relatedType of getRelatedTypes(type)) {
    const relatedState = ensureTypeState(relatedType)
    relatedState.search = ''
    relatedState.loadedSearch = ''
    relatedState.page = 1
  }
}

const loadRelatedTypeTags = async (
  type: AdminTagType,
  options: {
    append?: boolean
  } = {},
): Promise<void> => {
  const relatedTypes = getRelatedTypes(type)
  const typesToLoad = options.append
    ? relatedTypes.filter((item) => ensureTypeState(item).hasNextPage)
    : relatedTypes

  await Promise.all(typesToLoad.map((item) => loadTypeTags(item, options)))
}

const loadTypeTags = async (
  type: AdminTagType,
  options: {
    append?: boolean
  } = {},
): Promise<void> => {
  const state = ensureTypeState(type)

  if (state.isLoading || state.isLoadingMore) {
    return
  }

  const page = options.append ? state.page + 1 : 1
  const requestedSearch = state.search.trim()

  try {
    state.error = null

    if (options.append) {
      state.isLoadingMore = true
    } else {
      state.isLoading = true
    }

    const result = await fetchAdminTags({
      limit: state.limit,
      page,
      search: requestedSearch || undefined,
      typeId: type.id,
    })
    const loadedTags = result.data.map((tag) => toAdminTag(tag, type))
    const currentTags = options.append ? state.tags : []
    const tagMap = new Map<string, AdminTag>()

    for (const tag of [...currentTags, ...loadedTags]) {
      tagMap.set(tag.id, tag)
    }

    state.tags = [...tagMap.values()]
    state.loadedSearch = requestedSearch.toLowerCase()
    state.page = result.meta?.page ?? page
    state.total = result.meta?.total ?? state.tags.length
    state.hasNextPage = result.meta?.hasNextPage ?? false
  } catch {
    state.error = options.append ? t('admin.tags.loadMoreError') : t('admin.tags.loadError')
  } finally {
    state.isLoading = false
    state.isLoadingMore = false
  }
}

const createTagFromSearch = async (type: AdminTagType): Promise<void> => {
  const state = ensureTypeState(type)
  const name = state.search.trim()

  if (!name || state.isCreating) {
    return
  }

  clearRelatedSearchTimers(type)

  try {
    state.error = null
    state.isCreating = true

    const createdTag = toAdminTag(await fetchAdminCreateTag({ name, typeId: type.id }), type)
    state.tags = [createdTag, ...state.tags.filter((tag) => tag.id !== createdTag.id)]
    state.total = Math.max(state.total + 1, state.tags.length)
    resetRelatedSearch(type)

    if (!isSelected(createdTag.id)) {
      toggleTag(type, createdTag)
    }

    await loadRelatedTypeTags(type)

    if (!state.tags.some((tag) => tag.id === createdTag.id)) {
      state.tags = [createdTag, ...state.tags]
      state.total = Math.max(state.total, state.tags.length)
    }

    toast.add({ severity: 'success', summary: t('admin.tags.toastCreated'), life: 2400 })
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    state.isCreating = false
  }
}

const toggleTag = (type: AdminTagType, tag: AdminTag): void => {
  const nextTag = toAdminTag(tag, type)
  const normalizedType = normalizeTagTypeName(type.name)

  if (isSelected(tag.id)) {
    selectedTags.value = selectedTags.value.filter((selectedTag) => selectedTag.id !== tag.id)
    return
  }

  if (isSingleSelectTagType(normalizedType)) {
    selectedTags.value = [
      ...selectedTags.value.filter(
        (selectedTag) => resolveTagTypeName(selectedTag, props.tagTypes) !== normalizedType,
      ),
      nextTag,
    ]
    return
  }

  selectedTags.value = [...selectedTags.value, nextTag]
}

watch(
  sortedTagTypes,
  (types) => {
    const currentTypeIds = new Set(types.map((type) => type.id))

    for (const typeId of Object.keys(stateByTypeId)) {
      if (!currentTypeIds.has(typeId)) {
        delete stateByTypeId[typeId]
      }
    }

    for (const type of types) {
      ensureTypeState(type)
      loadTypeTags(type)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  for (const timer of searchTimers.values()) {
    clearTimeout(timer)
  }
})
</script>
