<template>
  <section
    class="grid gap-4 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-4 min-[860px]:grid-cols-2 min-[1280px]:grid-cols-[minmax(14rem,1fr)_minmax(18rem,1.25fr)_11rem_11rem_minmax(9rem,auto)] min-[1280px]:items-end"
  >
    <FloatLabel variant="on">
      <IconField>
        <InputIcon class="pi pi-search text-(--color-search-icon)!" />
        <InputText
          id="search_page_query"
          v-model="queryModel"
          class="h-12! w-full! rounded-md!"
        />
      </IconField>
      <label for="search_page_query">{{ t('search.filters.query') }}</label>
    </FloatLabel>

    <FloatLabel variant="on">
      <MultiSelect
        id="search_page_tags"
        v-model="selectedTagIdsModel"
        class="h-12! w-full!"
        display="chip"
        filter
        option-group-children="items"
        option-group-label="label"
        option-label="name"
        option-value="id"
        :loading="isTagsLoading"
        :max-selected-labels="2"
        :options="tagGroups"
        :placeholder="t('search.filters.tags')"
        :selected-items-label="selectedItemsLabel"
      />
      <label for="search_page_tags">{{ t('search.filters.tags') }}</label>
    </FloatLabel>

    <FloatLabel variant="on">
      <Select
        id="search_page_tag_mode"
        v-model="tagModeModel"
        class="h-12! w-full!"
        option-label="label"
        option-value="value"
        :options="tagModeOptions"
      />
      <label for="search_page_tag_mode">{{ t('search.filters.tagMode') }}</label>
    </FloatLabel>

    <FloatLabel variant="on">
      <Select
        id="search_page_sort"
        v-model="sortModeModel"
        class="h-12! w-full!"
        option-label="label"
        option-value="value"
        :options="sortOptions"
      />
      <label for="search_page_sort">{{ t('search.filters.date') }}</label>
    </FloatLabel>

    <Button
      class="h-12! w-full! min-w-36 justify-center!"
      icon="pi pi-times"
      severity="secondary"
      :label="t('search.filters.reset')"
      @click="emit('reset')"
    />
  </section>
</template>

<script setup lang="ts">
import FloatLabel from 'primevue/floatlabel'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameSearchTag, GameTagTypeWithTags } from '../types/game'

type TagMode = 'all' | 'any'
type SortMode = 'created_desc' | 'created_asc'

type TagGroup = {
  label: string
  items: GameSearchTag[]
}

const props = defineProps<{
  isTagsLoading?: boolean
  query: string
  selectedTagIds: string[]
  sortMode: SortMode
  tagMode: TagMode
  tagTypes: GameTagTypeWithTags[]
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  'update:selectedTagIds': [value: string[]]
  'update:sortMode': [value: SortMode]
  'update:tagMode': [value: TagMode]
  reset: []
}>()

const { t, te } = useI18n()

const queryModel = computed({
  get: () => props.query,
  set: (value: string) => emit('update:query', value),
})
const selectedTagIdsModel = computed({
  get: () => props.selectedTagIds,
  set: (value: string[]) => emit('update:selectedTagIds', value),
})
const tagModeModel = computed({
  get: () => props.tagMode,
  set: (value: TagMode) => emit('update:tagMode', value),
})
const sortModeModel = computed({
  get: () => props.sortMode,
  set: (value: SortMode) => emit('update:sortMode', value),
})

const tagModeOptions = computed(() => [
  { label: t('search.filters.tagModeAll'), value: 'all' },
  { label: t('search.filters.tagModeAny'), value: 'any' },
])
const sortOptions = computed(() => [
  { label: t('search.filters.newest'), value: 'created_desc' },
  { label: t('search.filters.oldest'), value: 'created_asc' },
])
const selectedItemsLabel = computed(() => t('search.filters.selectedCount', { count: '{0}' }))

const getTagTypeLabel = (type: string): string => {
  const normalized = type === 'platforma' ? 'platform' : type
  const key = `admin.tagTypes.${normalized}`

  return te(key) ? t(key) : type
}

const tagGroups = computed<TagGroup[]>(() =>
  props.tagTypes
    .map((type) => ({
      label: getTagTypeLabel(type.name),
      items: [...(type.tags ?? [])].sort((first, second) => first.name.localeCompare(second.name)),
    }))
    .filter((group) => group.items.length > 0),
)
</script>
