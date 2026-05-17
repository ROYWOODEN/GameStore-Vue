<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <PageLoader v-if="isLoading" />
    <section v-else-if="games.length > 0">
      <div class="grid auto-rows-fr grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-5">
        <AnimatePresence>
          <motion.div
            v-for="game in games"
            :key="game.id"
            layout
            :initial="{ opacity: 0, y: 28, scale: 0.96 }"
            :while-in-view="{ opacity: 1, y: 0, scale: 1 }"
            :viewport="{ once: false, amount: 0.25 }"
            :while-hover="{ y: -8, scale: 1.015 }"
            :while-tap="{ scale: 0.985 }"
            :transition="{
              opacity: { duration: 0.3, ease: 'easeOut' },
              y: { duration: 0.28, ease: 'easeOut' },
              scale: { duration: 0.18, ease: 'easeOut' },
            }"
          >
            <GameCardItem :game="game" />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
    <RetryState
      v-else-if="loadError"
      :title="t('mainPage.loadErrorTitle')"
      :message="getMessage(loadError.message)"
      :action-label="t('mainPage.retry')"
      @retry="loadGames"
    />
    <section v-else>
      <div
        class="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center gap-3 text-center"
      >
        <h1 class="text-2xl font-bold text-(--color-on-surface)">
          {{ t('mainPage.emptyTitle') }}
        </h1>
        <p class="text-sm leading-6 text-(--color-on-surface-variant)">
          {{ t('mainPage.emptyDescription') }}
        </p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { GameCardItem, useGames } from '@/modules/game'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { AnimatePresence, motion } from 'motion-v'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { getGames, games, isLoading, loadError } = useGames()

const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()
const loadGames = async () => {
  try {
    await getGames()
  } catch (error: unknown) {
    showApiError(error)
  }
}

onMounted(() => loadGames())
</script>
