<template>
  <section
    class="grid gap-3"
    @dragenter.prevent="isDraggingOver = true"
    @dragover.prevent
    @dragleave="isDraggingOver = false"
    @drop.prevent="handleDrop"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-bold text-(--color-on-surface)">{{ translateMaybe(title) }}</h3>
        <p class="mt-1 text-xs text-(--color-on-surface-variant)">
          {{ translateMaybe(hint) }}
        </p>
      </div>

      <input
        ref="inputRef"
        class="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        @change="handleFileChange"
      />
      <button
        class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-4 text-sm font-bold text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
        type="button"
        @click="inputRef?.click()"
      >
        <VueIcon name="bs:images" />
        <span>{{ translateMaybe(buttonLabel) }}</span>
      </button>
    </div>

    <AnimatePresence
      v-if="previews.length > 0"
      as="div"
      mode="popLayout"
      class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3"
    >
      <motion.figure
        v-for="preview in previews"
        :key="preview.id"
        class="relative aspect-[4/3] overflow-hidden rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high)"
        layout="position"
        :initial="{ opacity: 0, y: 12, scale: 0.96 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, y: 10, scale: 0.9 }"
        :transition="{ duration: 0.18, ease: 'easeOut' }"
      >
        <img :src="preview.url" :alt="preview.file.name" class="h-full w-full object-cover" />
        <figcaption
          class="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-[0.7rem] font-semibold text-white"
        >
          {{ preview.file.name }}
        </figcaption>
        <button
          class="absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/30 bg-black/60 text-sm text-white transition-colors hover:border-(--color-error) hover:text-(--color-error)"
          type="button"
          :aria-label="t('admin.images.removePreview', { name: preview.file.name })"
          @click="removeFile(preview.id)"
        >
          <VueIcon name="bs:x-lg" />
        </button>
      </motion.figure>
    </AnimatePresence>

    <div
      v-else
      :class="[
        'flex min-h-28 items-center justify-center rounded-md border border-dashed px-4 text-center text-sm transition-colors',
        isDraggingOver
          ? 'border-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary)'
          : 'border-(--color-outline-variant) bg-(--color-surface-container-low) text-(--color-on-surface-variant)',
      ]"
    >
      {{ t('admin.images.dragDropEmpty') }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type ImagePreview = {
  id: string
  file: File
  url: string
}

const files = defineModel<File[]>('files', { required: true })

withDefaults(
  defineProps<{
    buttonLabel?: string
    hint?: string
    title?: string
  }>(),
  {
    buttonLabel: 'admin.upload.buttonLabel',
    hint: 'admin.upload.hint',
    title: 'admin.upload.title',
  },
)

const inputRef = ref<HTMLInputElement | null>(null)
const previews = ref<ImagePreview[]>([])
const isDraggingOver = ref(false)
const { t, te } = useI18n()

const translateMaybe = (value: string): string => {
  return te(value) ? t(value) : value
}

const selectedFilesKey = computed(() =>
  files.value.map((file) => `${file.name}-${file.size}-${file.lastModified}`).join('|'),
)

const revokePreviews = (): void => {
  for (const preview of previews.value) {
    URL.revokeObjectURL(preview.url)
  }
}

const syncPreviews = (): void => {
  revokePreviews()
  previews.value = files.value.map((file, index) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
    file,
    url: URL.createObjectURL(file),
  }))
}

const handleFileChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files ?? [])

  addFiles(selectedFiles)

  input.value = ''
}

const addFiles = (selectedFiles: File[]): void => {
  const imageFiles = selectedFiles.filter((file) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
  )

  if (imageFiles.length > 0) {
    files.value = [...files.value, ...imageFiles].slice(0, 10)
  }
}

const handleDrop = (event: DragEvent): void => {
  isDraggingOver.value = false
  addFiles(Array.from(event.dataTransfer?.files ?? []))
}

const removeFile = (id: string): void => {
  const preview = previews.value.find((item) => item.id === id)

  if (!preview) {
    return
  }

  files.value = files.value.filter((file) => file !== preview.file)
}

watch(selectedFilesKey, syncPreviews, { immediate: true })

onBeforeUnmount(() => {
  revokePreviews()
})
</script>
