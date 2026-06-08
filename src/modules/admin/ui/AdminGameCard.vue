<template>
  <article
    class="grid min-h-[11.25rem] gap-4 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-4 text-(--color-on-surface) shadow-sm min-[760px]:grid-cols-[11rem_minmax(0,1fr)] min-[760px]:items-center min-[1100px]:grid-cols-[11rem_minmax(0,1fr)_auto]"
  >
    <div
      class="relative aspect-[16/10] overflow-hidden rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) min-[760px]:aspect-[4/3]"
    >
      <img v-if="coverUrl" :src="coverUrl" :alt="coverAlt" class="h-full w-full object-cover" />
      <div
        v-else
        class="flex h-full w-full items-center justify-center text-4xl text-(--color-on-surface-variant)"
      >
        <VueIcon name="bs:image" />
      </div>
      <span
        class="absolute top-2 left-2 rounded-md border border-white/30 bg-black/60 px-2 py-1 text-[0.7rem] font-bold text-white"
      >
        ID {{ game.id }}
      </span>
    </div>

    <div class="min-w-0">
      <div class="mb-2 flex flex-wrap items-center gap-2">
        <h2 class="line-clamp-1 text-xl font-extrabold text-(--color-on-surface)">
          {{ game.title }}
        </h2>
        <span
          class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-2 py-1 text-xs font-bold text-(--color-on-surface-variant)"
        >
          {{ formattedPrice }}
        </span>
      </div>
      <p class="line-clamp-2 text-sm leading-6 text-(--color-on-surface-variant)">
        {{ game.description }}
      </p>

      <div
        class="mt-3 grid gap-2 text-xs font-semibold text-(--color-on-surface-variant) min-[1280px]:grid-cols-2"
      >
        <span class="date-pill">
          <VueIcon class="date-pill-icon" name="bs:calendar-plus" />
          <span class="date-pill-text">
            {{ t('admin.games.createdAt', { date: formattedCreatedDate }) }}
          </span>
        </span>
        <span class="date-pill">
          <VueIcon class="date-pill-icon" name="bs:clock-history" />
          <span class="date-pill-text">
            {{ t('admin.games.updatedAt', { date: formattedUpdatedDate }) }}
          </span>
        </span>
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="tag in visibleTags"
          :key="`${tag.id}-${tag.name}`"
          class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-2.5 py-1 text-xs font-semibold text-(--color-on-surface-variant)"
        >
          {{ tag.name }}
        </span>
        <span
          v-if="hiddenTagCount > 0"
          class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-2.5 py-1 text-xs font-semibold text-(--color-on-surface-variant)"
        >
          +{{ hiddenTagCount }}
        </span>
      </div>

      <div v-if="platformTags.length > 0" class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="platform in platformTags"
          :key="`platform-${platform.id}-${platform.name}`"
          class="flex h-8 w-8 items-center justify-center rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) text-base text-(--color-on-surface-variant)"
          :title="getPlatformLabel(platform.name)"
          :aria-label="getPlatformLabel(platform.name)"
        >
          <VueIcon :name="getPlatformIcon(platform.name)" />
        </span>
      </div>
    </div>

    <div
      class="grid gap-2 min-[760px]:col-span-2 min-[1100px]:col-span-1 min-[1100px]:flex min-[1100px]:flex-col min-[1100px]:justify-end"
    >
      <button
        class="action-button border-(--color-primary) bg-(--color-primary) text-(--color-on-primary) hover:border-(--color-primary-strong) hover:bg-(--color-primary-strong)"
        type="button"
        @click="emit('edit', game.id)"
      >
        <VueIcon name="bs:pencil-square" />
        <span>{{ t('admin.games.card.edit') }}</span>
      </button>
      <button
        class="action-button border-(--color-error) bg-[color-mix(in_srgb,var(--color-surface-container-high)_80%,var(--color-error)_20%)] text-(--color-error) hover:bg-(--color-error) hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        :disabled="isDeleting"
        @click="emit('delete', game)"
      >
        <i v-if="isDeleting" class="pi pi-spin pi-spinner" />
        <VueIcon v-else name="bs:trash" />
        <span>{{
          isDeleting ? t('admin.games.card.deleting') : t('admin.games.card.delete')
        }}</span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { AdminGameListItem } from '../types/admin'
import { buildAssetUrl } from '@/shared/lib/url'
import { formatRubPrice, isFreePrice } from '@/shared/lib/price'
import { useDateFormat } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getPlatformIcon, getPlatformLabel, getTagTypeName } from '../lib/tags'

const props = withDefaults(
  defineProps<{
    game: AdminGameListItem
    isDeleting?: boolean
  }>(),
  {
    isDeleting: false,
  },
)

const emit = defineEmits<{
  delete: [game: AdminGameListItem]
  edit: [gameId: string]
}>()

const apiUrl = import.meta.env.VITE_API_URL
const { locale, t } = useI18n()

const coverImage = computed(
  () =>
    [...props.game.media.images].sort(
      (first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0),
    )[0],
)
const coverUrl = computed(() => buildAssetUrl(coverImage.value?.url, apiUrl))
const coverAlt = computed(() => coverImage.value?.alt || props.game.title)
const isFree = computed(() => isFreePrice(props.game.price))
const formattedPrice = computed(() =>
  isFree.value ? t('game.free') : formatRubPrice(props.game.price),
)
const platformTags = computed(() =>
  props.game.tags.filter((tag) => getTagTypeName(tag) === 'platform'),
)
const nonPlatformTags = computed(() =>
  props.game.tags.filter((tag) => getTagTypeName(tag) !== 'platform'),
)
const visibleTags = computed(() => nonPlatformTags.value.slice(0, 6))
const hiddenTagCount = computed(() =>
  Math.max(0, nonPlatformTags.value.length - visibleTags.value.length),
)

const getDateValue = (value: string | undefined): Date | null => {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

const createdDate = computed(() => getDateValue(props.game.created_at))
const updatedDate = computed(() => getDateValue(props.game.updated_at ?? props.game.created_at))
const createdDateForFormat = computed(() => createdDate.value ?? new Date(0))
const updatedDateForFormat = computed(() => updatedDate.value ?? new Date(0))
const rawCreatedDate = useDateFormat(createdDateForFormat, 'DD MMM YYYY, HH:mm', {
  locales: locale,
})
const rawUpdatedDate = useDateFormat(updatedDateForFormat, 'DD MMM YYYY, HH:mm', {
  locales: locale,
})
const formattedCreatedDate = computed(() =>
  createdDate.value ? rawCreatedDate.value : t('admin.games.noDate'),
)
const formattedUpdatedDate = computed(() =>
  updatedDate.value ? rawUpdatedDate.value : t('admin.games.noDate'),
)
</script>

<style scoped>
.action-button {
  display: inline-flex;
  height: 2.75rem;
  min-width: 0;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border-width: 1px;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 800;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}

.date-pill {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  min-width: 0;
  align-items: center;
  gap: 0.375rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-high);
  padding: 0.375rem 0.5rem;
}

.date-pill-icon {
  flex-shrink: 0;
}

.date-pill-text {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.35;
}
</style>
