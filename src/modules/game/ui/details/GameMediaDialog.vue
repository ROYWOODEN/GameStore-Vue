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
      @pointerdown.passive="handlePointerDown"
      @pointerup.passive="handlePointerUp"
    >
      <button
        class="absolute top-4 right-4 z-20 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/30 bg-black/60 text-xl text-white backdrop-blur transition hover:bg-white hover:text-black"
        type="button"
        :aria-label="t('gameDetails.closeMedia')"
        @click="visible = false"
      >
        <VueIcon name="bs:x" />
      </button>

      <template v-if="canNavigate">
        <button
          class="absolute top-1/2 left-3 z-20 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/30 bg-black/60 text-2xl text-white backdrop-blur transition hover:bg-white hover:text-black min-[640px]:left-5 min-[640px]:h-13 min-[640px]:w-13"
          type="button"
          :aria-label="t('gameDetails.media.previous')"
          @click.stop="emit('previous')"
        >
          <VueIcon name="bs:chevron-left" />
        </button>
        <button
          class="absolute top-1/2 right-3 z-20 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/30 bg-black/60 text-2xl text-white backdrop-blur transition hover:bg-white hover:text-black min-[640px]:right-5 min-[640px]:h-13 min-[640px]:w-13"
          type="button"
          :aria-label="t('gameDetails.media.next')"
          @click.stop="emit('next')"
        >
          <VueIcon name="bs:chevron-right" />
        </button>
      </template>

      <img
        v-if="media?.type === 'image'"
        class="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl"
        :src="media.url"
        alt=""
        aria-hidden="true"
      />
      <img
        v-if="media?.type === 'image'"
        class="relative z-1 max-h-[82vh] w-full touch-pan-y object-contain select-none"
        :src="media.url"
        :alt="media.alt"
        draggable="false"
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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  items: GameDetailMediaItem[]
  media: GameDetailMediaItem | undefined
}>()

const emit = defineEmits<{
  next: []
  previous: []
}>()

const visible = defineModel<boolean>('visible', { required: true })
const { t } = useI18n()
const pointerStartX = ref<number | null>(null)
const swipeThreshold = 48
const canNavigate = computed(() => props.items.length > 1)

const handlePointerDown = (event: PointerEvent): void => {
  if (!canNavigate.value || event.pointerType === 'mouse') {
    return
  }

  pointerStartX.value = event.clientX
}

const handlePointerUp = (event: PointerEvent): void => {
  if (!canNavigate.value || pointerStartX.value === null || event.pointerType === 'mouse') {
    pointerStartX.value = null
    return
  }

  const deltaX = event.clientX - pointerStartX.value
  pointerStartX.value = null

  if (Math.abs(deltaX) < swipeThreshold) {
    return
  }

  if (deltaX < 0) {
    emit('next')
  } else {
    emit('previous')
  }
}

const dialogPassThrough = {
  mask: {
    class: 'backdrop-blur-sm!',
  },
}
</script>
