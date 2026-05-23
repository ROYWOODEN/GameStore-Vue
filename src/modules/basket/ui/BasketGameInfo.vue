<template>
  <div class="min-w-0 space-y-3">
    <div class="min-w-0">
      <h2 class="line-clamp-2 text-xl leading-tight font-extrabold min-[760px]:text-2xl">
        {{ game.title }}
      </h2>

      <div v-if="platformTags.length > 0" class="mt-3 flex flex-wrap items-center gap-2">
        <span class="sr-only">{{ t('game.platforms') }}</span>
        <span
          v-for="platform in platformTags"
          :key="platform.name"
          class="flex h-8 w-8 items-center justify-center rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) text-base text-(--color-on-surface-variant)"
          :title="platform.name"
        >
          <VueIcon :name="getPlatformIcon(platform)" />
        </span>
      </div>
    </div>

    <div v-if="compactTags.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="tag in compactTags"
        :key="tag.name"
        class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-2.5 py-1 text-xs font-semibold text-(--color-on-surface-variant)"
      >
        {{ tag.name }}
      </span>
    </div>

    <p class="line-clamp-2 max-w-2xl text-sm leading-6 text-(--color-on-surface-variant)">
      {{ game.description || t('basketPage.noDescription') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameTag } from '@/shared/types/game'
import type { BasketGame } from '../types/basket'

const props = defineProps<{
  game: BasketGame
}>()

const { t } = useI18n()

const platformTags = computed(() => props.game.tags.filter((tag) => tag.type === 'platforma'))
const compactTags = computed(() =>
  props.game.tags.filter((tag) => ['genre', 'mode', 'theme'].includes(tag.type)).slice(0, 3),
)

const platformIcons: Record<string, string> = {
  linux: 'bs:ubuntu',
  macos: 'bs:apple',
  playstation: 'bs:playstation',
  switch: 'bs:nintendo-switch',
  windows: 'bs:windows',
  xbox: 'bs:xbox',
}

const getPlatformIcon = (platform: GameTag): string => platformIcons[platform.name] ?? 'bs:display'
</script>
