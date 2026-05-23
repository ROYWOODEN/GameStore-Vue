<template>
  <div
    class="flex min-w-0 flex-wrap items-center justify-between gap-3 min-[760px]:flex-col min-[760px]:items-end min-[760px]:justify-center"
  >
    <div class="text-xl font-extrabold text-(--color-primary) min-[760px]:text-right">
      {{ formattedPrice }}
    </div>

    <button
      class="flex h-11 min-w-32 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-error)_62%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_12%,var(--color-surface-container-high))] px-4 text-sm font-semibold text-(--color-error) transition-colors hover:border-(--color-error) hover:bg-[color-mix(in_srgb,var(--color-error)_18%,var(--color-surface-container-high))] disabled:cursor-wait disabled:opacity-75 min-[760px]:w-full min-[760px]:min-w-0"
      type="button"
      :aria-label="t('basketPage.removeItem', { title: game.title })"
      :disabled="pending"
      @click.stop="emit('remove', { id: game.id, price: game.price })"
    >
      <AnimatePresence mode="wait">
        <motion.span
          :key="pending ? 'pending' : 'idle'"
          class="flex"
          :initial="{ opacity: 0, y: 7 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -7 }"
          :transition="{ duration: 0.16, ease: 'easeOut' }"
        >
          <i v-if="pending" class="pi pi-spin pi-spinner text-base" />
          <VueIcon v-else name="bs:trash3" class="text-base" />
        </motion.span>
      </AnimatePresence>
      <span>{{ pending ? t('basketPage.removing') : t('basketPage.remove') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { formatRubPrice } from '@/shared/lib/price'
import { AnimatePresence, motion } from 'motion-v'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BasketGame } from '../types/basket'

const props = defineProps<{
  game: BasketGame
  pending: boolean
}>()

const emit = defineEmits<{
  remove: [game: Pick<BasketGame, 'id' | 'price'>]
}>()

const { t } = useI18n()
const formattedPrice = computed(() => formatRubPrice(props.game.price))
</script>
