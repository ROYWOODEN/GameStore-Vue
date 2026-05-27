<template>
  <section class="grid gap-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-bold text-(--color-on-surface)">
          {{ t('admin.images.title') }}
        </h3>
        <p class="mt-1 text-xs text-(--color-on-surface-variant)">
          {{ t('admin.images.description') }}
        </p>
      </div>
      <span class="text-xs font-semibold text-(--color-on-surface-variant)">
        {{ t('admin.images.count', { count: images.length }) }}
      </span>
    </div>

    <AnimatePresence
      v-if="sortedImages.length > 0"
      as="div"
      mode="popLayout"
      class="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-3"
    >
      <motion.figure
        v-for="(image, index) in sortedImages"
        :key="image.id ?? image.url"
        :class="[
          'relative overflow-hidden rounded-md border bg-(--color-surface-container-high) transition-colors',
          draggedImageId === image.id
            ? 'border-(--color-primary) opacity-60'
            : dragOverImageId === image.id
              ? 'border-(--color-primary)'
              : 'border-(--color-outline-variant)',
        ]"
        :draggable="Boolean(image.id) && !isReordering"
        layout="position"
        :initial="{ opacity: 0, y: 12, scale: 0.96 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, y: 8, scale: 0.92 }"
        :transition="{ duration: 0.18, ease: 'easeOut' }"
        @dragstart="handleDragStart($event, image.id)"
        @dragenter.prevent="handleDragEnter(image.id)"
        @dragover.prevent
        @dragleave="handleDragLeave(image.id)"
        @drop.prevent="handleDrop(image.id)"
        @dragend="resetDragState"
      >
        <button
          class="block aspect-[4/3] w-full cursor-zoom-in overflow-hidden text-left"
          type="button"
          :aria-label="t('admin.images.preview')"
          @click="openPreview(image)"
        >
          <img
            v-if="getImageUrl(image.url)"
            :src="getImageUrl(image.url) ?? undefined"
            :alt="image.alt || t('admin.images.alt')"
            draggable="false"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-3xl text-(--color-on-surface-variant)"
          >
            <VueIcon name="bs:image" />
          </div>
        </button>

        <div class="image-overlay-actions">
          <button
            class="image-overlay-button"
            type="button"
            :aria-label="t('admin.images.movePrevious')"
            :disabled="index === 0 || isReordering"
            @click="moveImage(index, index - 1)"
          >
            <VueIcon name="bs:chevron-left" />
          </button>
          <button
            class="image-overlay-button image-overlay-delete"
            type="button"
            :aria-label="t('admin.images.remove')"
            :disabled="!image.id || deletingImageIds.includes(image.id)"
            @click="image.id && emit('delete', image.id)"
          >
            <i
              v-if="image.id && deletingImageIds.includes(image.id)"
              class="pi pi-spin pi-spinner"
            />
            <VueIcon v-else name="bs:trash" />
          </button>
          <button
            class="image-overlay-button"
            type="button"
            :aria-label="t('admin.images.moveNext')"
            :disabled="index === sortedImages.length - 1 || isReordering"
            @click="moveImage(index, index + 1)"
          >
            <VueIcon name="bs:chevron-right" />
          </button>
        </div>

        <figcaption
          class="flex items-center justify-between gap-2 border-t border-(--color-outline-variant) bg-(--color-surface-container) px-2 py-2"
        >
          <span class="truncate text-xs font-semibold text-(--color-on-surface)">
            #{{ index + 1 }}
          </span>
          <span class="flex items-center gap-1">
            <span
              class="image-drag-handle"
              :title="t('admin.images.reorderHint')"
              aria-hidden="true"
            >
              <VueIcon name="bs:grip-vertical" />
            </span>
          </span>
        </figcaption>
      </motion.figure>
    </AnimatePresence>

    <div
      v-else
      class="flex min-h-28 items-center justify-center rounded-md border border-dashed border-(--color-outline-variant) bg-(--color-surface-container-low) px-4 text-center text-sm text-(--color-on-surface-variant)"
    >
      {{ t('admin.images.empty') }}
    </div>

    <AdminImagePreviewDialog v-model:visible="isPreviewVisible" :image="selectedPreviewImageData" />
  </section>
</template>

<script setup lang="ts">
import { buildAssetUrl } from '@/shared/lib/url'
import { AnimatePresence, motion } from 'motion-v'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AdminGameImage } from '../types/admin'
import AdminImagePreviewDialog from './AdminImagePreviewDialog.vue'

const props = withDefaults(
  defineProps<{
    deletingImageIds?: string[]
    images: AdminGameImage[]
    isReordering?: boolean
  }>(),
  {
    deletingImageIds: () => [],
    isReordering: false,
  },
)

const emit = defineEmits<{
  delete: [imageId: string]
  reorder: [imageIds: string[]]
}>()

const apiUrl = import.meta.env.VITE_API_URL
const draggedImageId = ref<string | null>(null)
const dragOverImageId = ref<string | null>(null)
const selectedPreviewImageId = ref<string | null>(null)
const isPreviewVisible = ref(false)
const { t } = useI18n()

const sortedImages = computed(() =>
  [...props.images].sort((first, second) => (first.sort_order ?? 0) - (second.sort_order ?? 0)),
)

const getImageUrl = (path: string): string | null => buildAssetUrl(path, apiUrl)

const selectedPreviewImage = computed(() =>
  sortedImages.value.find((image) => (image.id ?? image.url) === selectedPreviewImageId.value),
)

const selectedPreviewImageData = computed<{ alt: string; url: string } | undefined>(() => {
  const image = selectedPreviewImage.value
  const url = image ? getImageUrl(image.url) : null

  if (!image || !url) {
    return undefined
  }

  return {
    url,
    alt: image.alt || t('admin.images.alt'),
  }
})

const openPreview = (image: AdminGameImage): void => {
  selectedPreviewImageId.value = image.id ?? image.url
  isPreviewVisible.value = true
}

const emitReorder = (nextImages: AdminGameImage[]): void => {
  const imageIds = nextImages.map((image) => image.id).filter((id): id is string => Boolean(id))

  if (imageIds.length !== nextImages.length) {
    return
  }

  emit('reorder', imageIds)
}

const moveImage = (index: number, targetIndex: number): void => {
  const nextImages = [...sortedImages.value]
  const current = nextImages[index]

  if (!current?.id || !nextImages[targetIndex]?.id) {
    return
  }

  nextImages.splice(index, 1)
  nextImages.splice(targetIndex, 0, current)

  emitReorder(nextImages)
}

const resetDragState = (): void => {
  draggedImageId.value = null
  dragOverImageId.value = null
}

const handleDragStart = (event: DragEvent, imageId: string | undefined): void => {
  if (!imageId || props.isReordering) {
    return
  }

  draggedImageId.value = imageId
  event.dataTransfer?.setData('text/plain', imageId)

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragEnter = (imageId: string | undefined): void => {
  if (!imageId || imageId === draggedImageId.value) {
    return
  }

  dragOverImageId.value = imageId
}

const handleDragLeave = (imageId: string | undefined): void => {
  if (dragOverImageId.value === imageId) {
    dragOverImageId.value = null
  }
}

const handleDrop = (targetImageId: string | undefined): void => {
  const sourceImageId = draggedImageId.value

  if (!sourceImageId || !targetImageId || sourceImageId === targetImageId) {
    resetDragState()
    return
  }

  const sourceIndex = sortedImages.value.findIndex((image) => image.id === sourceImageId)
  const targetIndex = sortedImages.value.findIndex((image) => image.id === targetImageId)

  if (sourceIndex === -1 || targetIndex === -1) {
    resetDragState()
    return
  }

  moveImage(sourceIndex, targetIndex)
  resetDragState()
}
</script>

<style scoped>
.image-overlay-button {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 0.22);
  background: rgb(15 16 20 / 0.72);
  color: #ffffff;
  box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 0.24);
  backdrop-filter: blur(8px);
  transition:
    background-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease,
    transform 160ms ease;
}

.image-overlay-button:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: translateY(-1px);
}

.image-overlay-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.image-overlay-actions {
  position: absolute;
  right: 0.5rem;
  bottom: 3.25rem;
  left: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.image-overlay-actions > * {
  pointer-events: auto;
}

.image-overlay-delete {
  border-color: rgb(255 92 108 / 0.44);
  color: #ffb3bd;
}

.image-overlay-delete:hover:not(:disabled) {
  background: var(--color-error);
  color: #ffffff;
}

.image-drag-handle {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  cursor: grab;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  color: var(--color-on-surface-variant);
  touch-action: none;
}

.image-drag-handle:active {
  cursor: grabbing;
}
</style>
