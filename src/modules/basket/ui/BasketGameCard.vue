<template>
  <motion.article
    layout
    class="group grid w-full min-w-0 gap-4 rounded-lg border border-(--color-outline-variant) bg-[color-mix(in_srgb,var(--color-surface-container-low)_93%,var(--color-primary)_7%)] p-3 text-(--color-on-surface) shadow-[0_14px_34px_rgb(0_0_0/0.13)] transition-colors hover:border-(--color-primary) min-[760px]:grid-cols-[3rem_minmax(0,12rem)_minmax(0,1fr)_9rem] min-[760px]:items-center min-[760px]:p-4 min-[1440px]:grid-cols-[3rem_minmax(0,13rem)_minmax(0,1fr)_10rem]"
  >
    <BasketGameSelectControl
      :input-id="selectionId"
      :label="t('basketPage.selectItem', { title: game.title })"
      :selected="selected"
      @update:selected="emit('selectionChange', game.id, $event)"
    />
    <BasketGameCover :game="game" />
    <BasketGameInfo :game="game" />
    <BasketGameActions :game="game" :pending="pending" @remove="emit('remove', $event)" />
  </motion.article>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BasketGame } from '../types/basket'
import BasketGameActions from './BasketGameActions.vue'
import BasketGameCover from './BasketGameCover.vue'
import BasketGameInfo from './BasketGameInfo.vue'
import BasketGameSelectControl from './BasketGameSelectControl.vue'

const props = withDefaults(
  defineProps<{
    game: BasketGame
    pending?: boolean
    selected?: boolean
  }>(),
  {
    pending: false,
    selected: false,
  },
)

const emit = defineEmits<{
  remove: [game: Pick<BasketGame, 'id' | 'price'>]
  selectionChange: [gameId: BasketGame['id'], selected: boolean]
}>()

const { t } = useI18n()

const selectionId = computed(() => `basket-game-${props.game.id}`)
</script>
