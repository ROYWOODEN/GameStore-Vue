<template>
  <span
    class="game-tag inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold backdrop-blur"
    :class="{ 'px-3! py-2!': size === 'lg' }"
    :data-tag-type="tagType"
    :title="displayName"
  >
    <VueIcon :name="getTagIcon(tag)" class="text-base" />
    <span v-if="!iconOnly">{{ displayName }}</span>
  </span>
</template>

<script setup lang="ts">
import type { GameListTag } from '@/modules/game'
import { getTagIcon, getTagTypeName } from '@/modules/game/lib/tags'
import { getPlatformLabel } from '@/shared/lib/platforms'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    iconOnly?: boolean
    size?: 'md' | 'lg'
    tag: GameListTag
  }>(),
  {
    iconOnly: false,
    size: 'md',
  },
)

const tagType = computed(() => getTagTypeName(props.tag))
const displayName = computed(() =>
  tagType.value === 'platforma' ? getPlatformLabel(props.tag.name) : props.tag.name,
)
</script>

<style scoped>
.game-tag {
  --tag-accent: var(--color-primary);
  background: color-mix(in srgb, var(--tag-accent) 18%, var(--color-surface-container-high));
  border-color: color-mix(in srgb, var(--tag-accent) 58%, transparent);
  color: color-mix(in srgb, var(--tag-accent) 62%, var(--color-on-surface));
}

.game-tag[data-tag-type='genre'] {
  --tag-accent: #10b981;
}

.game-tag[data-tag-type='mode'] {
  --tag-accent: #8b5cf6;
}

.game-tag[data-tag-type='age'] {
  --tag-accent: #ef4444;
}

.game-tag[data-tag-type='platforma'] {
  --tag-accent: #3b82f6;
}

.game-tag[data-tag-type='theme'] {
  --tag-accent: #f59e0b;
}

.game-tag[data-tag-type='feature'] {
  --tag-accent: #0ea5e9;
}

:global(.app-dark) .game-tag {
  background: color-mix(in srgb, var(--tag-accent) 25%, var(--color-surface-container-high));
  border-color: color-mix(in srgb, var(--tag-accent) 50%, transparent);
  color: color-mix(in srgb, white 82%, var(--tag-accent));
}
</style>
