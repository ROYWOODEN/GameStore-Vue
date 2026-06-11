<template>
  <Dialog
    v-model:visible="visibleProxy"
    modal
    dismissable-mask
    :header="
      game
        ? t('admin.games.dialog.editTitleWithGame', { title: game.title })
        : t('admin.games.dialog.editTitle')
    "
    :style="{ width: '64rem' }"
    :breakpoints="{ '1199px': '86vw', '760px': '96vw' }"
    :pt="dialogPassThrough"
  >
    <div v-if="isLoading" class="flex min-h-96 items-center justify-center">
      <ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="5"
        fill="transparent"
        animationDuration=".9s"
        :aria-label="t('common.loading')"
      />
    </div>

    <div v-else-if="game" class="grid gap-6">
      <AdminGameForm
        :current-images="game.media.images"
        :deleting-image-ids="deletingImageIds"
        :initial-game="game"
        :is-reordering="isReordering"
        :is-saving="isSaving"
        :require-images="false"
        :tag-types="tagTypes"
        mode="edit"
        show-cancel
        :submit-label="t('admin.games.dialog.saveChanges')"
        @cancel="emit('close')"
        @delete-image="emit('deleteImage', $event)"
        @reorder-images="emit('reorderImages', $event)"
        @submit="emit('save', $event)"
      />
    </div>

    <div v-else class="grid min-h-64 place-items-center text-center">
      <div>
        <h3 class="text-lg font-extrabold text-(--color-on-surface)">
          {{ t('admin.games.dialog.noGameTitle') }}
        </h3>
        <p class="mt-2 text-sm text-(--color-on-surface-variant)">
          {{ t('admin.games.dialog.noGameDescription') }}
        </p>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AdminGame, AdminGameFormPayload, AdminTagType } from '../types/admin'
import AdminGameForm from './AdminGameForm.vue'

const props = withDefaults(
  defineProps<{
    deletingImageIds?: string[]
    game: AdminGame | null
    isLoading?: boolean
    isReordering?: boolean
    isSaving?: boolean
    tagTypes: AdminTagType[]
    visible: boolean
  }>(),
  {
    deletingImageIds: () => [],
    isLoading: false,
    isReordering: false,
    isSaving: false,
  },
)

const emit = defineEmits<{
  close: []
  deleteImage: [imageId: string]
  reorderImages: [imageIds: string[]]
  save: [payload: AdminGameFormPayload]
}>()

const { t } = useI18n()

const visibleProxy = computed({
  get: () => props.visible,
  set: (visible: boolean) => {
    if (!visible) {
      emit('close')
    }
  },
})

const dialogPassThrough = {
  root: {
    class:
      'overflow-hidden rounded-xl! border! border-(--color-outline-variant)! bg-(--color-surface-container)! text-(--color-on-surface)! shadow-2xl!',
  },
  header: {
    class:
      'bg-(--color-surface-container)! px-4! pb-4! pt-5! text-(--color-on-surface)! sm:px-7! sm:pb-5! sm:pt-7!',
  },
  title: {
    class: 'text-xl! font-extrabold! sm:text-2xl!',
  },
  content: {
    class:
      'max-h-[78vh] overflow-y-auto bg-(--color-surface-container)! px-4! pb-5! text-(--color-on-surface)! sm:px-7! sm:pb-7!',
  },
  mask: {
    class: 'backdrop-blur-sm!',
  },
  closeButton: {
    class:
      'text-(--color-on-surface-variant)! hover:bg-(--color-surface-container-highest)! hover:text-(--color-on-surface)!',
  },
}
</script>
