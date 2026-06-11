<template>
  <motion.section
    :initial="{ opacity: 0, y: 24 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.34, delay: 0.16, ease: 'easeOut' }"
    class="overflow-hidden rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-low)/95 shadow-[0_18px_44px_rgb(0_0_0/0.18)] backdrop-blur"
  >
    <Carousel
      v-if="items.length > 0"
      :value="items"
      :num-visible="1"
      :num-scroll="1"
      :circular="items.length > 1"
      :autoplay-interval="items.length > 1 ? 6500 : 0"
      :show-navigators="items.length > 1"
      :show-indicators="items.length > 1"
      class="game-media-carousel"
    >
      <template #item="{ data }">
        <button
          class="group relative block aspect-video w-full overflow-hidden bg-black text-left"
          type="button"
          @click="emit('select', data.id)"
        >
          <img
            v-if="data.type === 'image'"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            :src="data.url"
            :alt="data.alt"
          />
          <video
            v-else-if="data.isPlayable"
            class="h-full w-full object-cover"
            :src="data.url"
            muted
            loop
            playsinline
          ></video>
          <div
            v-else
            class="grid h-full w-full place-items-center bg-[color-mix(in_srgb,var(--color-surface-container-high)_72%,var(--color-primary)_28%)] text-(--color-on-surface)"
          >
            <div class="grid justify-items-center gap-3 px-6 text-center">
              <VueIcon name="bs:play-btn" class="text-6xl text-(--color-primary)" />
              <span class="text-sm font-bold">{{ data.title }}</span>
              <span class="text-xs font-semibold text-(--color-on-surface-variant)">
                {{ t('gameDetails.media.external') }}
              </span>
            </div>
          </div>
          <div
            v-if="data.type === 'video'"
            class="pointer-events-none absolute inset-0 grid place-items-center bg-black/10"
          >
            <span
              class="grid h-18 w-18 place-items-center rounded-full border border-white/35 bg-black/55 text-3xl text-white backdrop-blur transition group-hover:scale-110"
            >
              <VueIcon name="bs:play-fill" />
            </span>
          </div>
        </button>
      </template>
    </Carousel>
    <div
      v-else
      class="grid aspect-video place-items-center bg-(--color-surface-container-high) text-(--color-on-surface-variant)"
    >
      <div class="grid justify-items-center gap-3">
        <VueIcon name="bs:image" class="text-5xl" />
        <span class="text-sm font-semibold">{{ t('gameDetails.media.empty') }}</span>
      </div>
    </div>
  </motion.section>
</template>

<script setup lang="ts">
import type { GameDetailMediaItem } from '@/modules/game/types/media'
import { motion } from 'motion-v'
import Carousel from 'primevue/carousel'
import { useI18n } from 'vue-i18n'

defineProps<{
  items: GameDetailMediaItem[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { t } = useI18n()
</script>

<style scoped>
.game-media-carousel :deep(.p-carousel-content) {
  position: relative;
}

.game-media-carousel :deep(.p-carousel-indicator-button) {
  width: 2rem;
  height: 0.35rem;
  border-radius: 999px;
}

.game-media-carousel :deep(.p-carousel-prev-button),
.game-media-carousel :deep(.p-carousel-next-button) {
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid rgb(255 255 255 / 0.3);
  background: rgb(0 0 0 / 0.55);
  color: white;
  backdrop-filter: blur(12px);
}

.game-media-carousel :deep(.p-carousel-prev-button) {
  left: 1rem;
}

.game-media-carousel :deep(.p-carousel-next-button) {
  right: 1rem;
}
</style>
