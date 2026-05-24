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
        class="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/60 text-xl text-white backdrop-blur transition hover:bg-white hover:text-black"
        type="button"
        :aria-label="t('gameDetails.closeMedia')"
        @click="visible = false"
      >
        <VueIcon name="bs:x" />
      </button>

      <img
        v-if="media?.type === 'image'"
        class="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
        :src="media.url"
        alt=""
        aria-hidden="true"
      />
      <img
        v-if="media?.type === 'image'"
        class="relative z-1 max-h-[82vh] w-full object-contain"
        :src="media.url"
        :alt="media.alt"
      />
      <video
        v-else-if="media?.isPlayable"
        class="relative z-1 max-h-[82vh] w-full"
        :src="media.url"
        controls
        autoplay
      ></video>
      <div v-else-if="media" class="relative z-1 grid gap-5 p-8 text-center">
        <VueIcon name="bs:play-btn" class="mx-auto text-7xl text-(--color-primary)" />
        <div class="grid gap-2">
          <h3 class="text-2xl font-bold text-(--color-on-surface)">
            {{ media.title }}
          </h3>
          <p class="max-w-md text-sm leading-6 text-(--color-on-surface-variant)">
            {{ t('gameDetails.media.externalDescription') }}
          </p>
        </div>
        <a
          class="inline-flex justify-self-center rounded-lg bg-(--color-primary) px-5 py-3 text-sm font-bold text-(--color-on-primary) transition hover:bg-(--color-primary-strong)"
          :href="media.url"
          target="_blank"
          rel="noreferrer"
        >
          {{ t('gameDetails.media.openExternal') }}
        </a>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { GameDetailMediaItem } from '@/modules/game/types/media'
import Dialog from 'primevue/dialog'
import { useI18n } from 'vue-i18n'

defineProps<{
  media: GameDetailMediaItem | undefined
}>()

const visible = defineModel<boolean>('visible', { required: true })
const { t } = useI18n()

const dialogPassThrough = {
  mask: {
    class: 'backdrop-blur-sm!',
  },
}
</script>
