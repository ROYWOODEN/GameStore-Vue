<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :show-header="false"
    class="w-[min(92vw,76rem)] overflow-hidden! rounded-xl! border! border-(--color-outline-variant)! bg-(--color-surface-container)!"
    content-class="p-0! bg-(--color-surface-container)!"
    :pt="dialogPassThrough"
  >
    <div
      class="relative grid max-h-[82vh] min-h-72 place-items-center overflow-hidden bg-(--color-surface-container)"
    >
      <button
        class="absolute top-4 right-4 z-10 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/30 bg-black/60 text-xl text-white backdrop-blur transition hover:bg-white hover:text-black"
        type="button"
        :aria-label="t('admin.images.closePreview')"
        @click="visible = false"
      >
        <VueIcon name="bs:x" />
      </button>

      <img
        v-if="image"
        class="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
        :src="image.url"
        alt=""
        aria-hidden="true"
      />
      <img
        v-if="image"
        class="relative z-1 max-h-[82vh] w-full object-contain"
        :src="image.url"
        :alt="image.alt"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog'
import { useI18n } from 'vue-i18n'

defineProps<{
  image:
    | {
        alt: string
        url: string
      }
    | undefined
}>()

const visible = defineModel<boolean>('visible', { required: true })
const { t } = useI18n()

const dialogPassThrough = {
  mask: {
    class: 'backdrop-blur-sm!',
  },
}
</script>
