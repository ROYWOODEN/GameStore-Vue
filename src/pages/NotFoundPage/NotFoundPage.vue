<template>
  <main
    class="relative min-h-[calc(100vh-4.5rem)] overflow-hidden bg-(--color-background) px-4 pt-8 pb-28 text-(--color-on-surface) min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <motion.section
      class="relative mx-auto grid min-h-[calc(100vh-9rem)] max-w-6xl content-center gap-8 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] min-[900px]:items-center"
      :initial="{ opacity: 0, y: 18 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.32, ease: 'easeOut' }"
    >
      <div class="grid min-w-0 gap-6">
        <motion.div
          class="inline-flex w-fit items-center gap-3 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-low) px-3 py-2 text-xs font-extrabold tracking-[0.18em] text-(--color-primary) uppercase"
          :initial="{ opacity: 0, x: -16 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.28, delay: 0.08, ease: 'easeOut' }"
        >
          <VueIcon name="bs:slash-circle" class="text-base" />
          <span>{{ t('notFound.eyebrow') }}</span>
        </motion.div>

        <div class="grid gap-4">
          <motion.h1
            class="max-w-3xl text-4xl leading-tight font-black break-words min-[560px]:text-6xl min-[1024px]:text-7xl"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.34, delay: 0.14, ease: 'easeOut' }"
          >
            {{ t('notFound.title') }}
          </motion.h1>
          <motion.p
            class="max-w-2xl text-base leading-7 text-(--color-on-surface-variant) min-[560px]:text-lg"
            :initial="{ opacity: 0, y: 16 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.3, delay: 0.2, ease: 'easeOut' }"
          >
            {{ t('notFound.description') }}
          </motion.p>
        </div>

        <motion.div
          v-if="requestedPath"
          class="min-w-0 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-low) px-4 py-3 text-sm font-semibold text-(--color-on-surface-variant)"
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.28, delay: 0.24, ease: 'easeOut' }"
        >
          <span class="block text-xs font-extrabold text-(--color-primary) uppercase">
            {{ t('notFound.requested') }}
          </span>
          <span class="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap">
            {{ requestedPath }}
          </span>
        </motion.div>

        <motion.div
          class="flex flex-col gap-3 min-[420px]:flex-row"
          :initial="{ opacity: 0, y: 14 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.28, delay: 0.3, ease: 'easeOut' }"
        >
          <RouterLink
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-(--color-primary) px-5 text-sm font-extrabold text-(--color-on-primary) transition-colors hover:bg-(--color-primary-strong)"
            to="/"
          >
            <VueIcon name="fl:home" class="text-lg" />
            <span>{{ t('notFound.home') }}</span>
          </RouterLink>
          <RouterLink
            class="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-5 text-sm font-extrabold text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
            to="/search"
          >
            <VueIcon name="bs:search" class="text-lg" />
            <span>{{ t('notFound.search') }}</span>
          </RouterLink>
        </motion.div>
      </div>

      <motion.div
        class="relative mx-auto grid aspect-square w-full max-w-[22rem] place-items-center min-[900px]:max-w-none"
        :initial="{ opacity: 0, scale: 0.92, rotate: -2 }"
        :animate="{ opacity: 1, scale: 1, rotate: 0 }"
        :transition="{ duration: 0.42, delay: 0.12, ease: [0.22, 1, 0.36, 1] }"
        aria-hidden="true"
      >
        <div
          class="absolute inset-0 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-low) shadow-[0_18px_54px_rgb(0_0_0/0.14)]"
        ></div>
        <div
          class="not-found-grid absolute inset-4 rounded-md border border-(--color-outline-variant)"
        />
        <motion.div
          class="relative grid h-44 w-44 place-items-center rounded-md border border-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary) shadow-[0_18px_44px_rgb(189_0_255/0.16)]"
          :animate="{ y: [0, -10, 0], rotate: [0, 2, 0] }"
          :transition="{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }"
        >
          <img src="/logo.svg" alt="" class="h-20 w-auto object-contain" />
          <span class="mt-2 text-5xl font-black leading-none">404</span>
        </motion.div>
        <motion.span
          class="absolute top-10 right-8 h-3 w-24 rounded-full bg-(--color-primary)"
          :animate="{ x: [-8, 8, -8], opacity: [0.45, 1, 0.45] }"
          :transition="{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }"
        />
        <motion.span
          class="absolute bottom-12 left-8 h-3 w-32 rounded-full bg-(--color-outline-variant)"
          :animate="{ x: [10, -10, 10], opacity: [0.35, 0.8, 0.35] }"
          :transition="{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }"
        />
      </motion.div>
    </motion.section>
  </main>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const { t } = useI18n()

const requestedPath = computed(() => {
  const from = route.query.from
  return typeof from === 'string' && from !== '/404' ? from : ''
})
</script>

<style scoped>
.not-found-grid {
  background-image:
    linear-gradient(var(--color-outline-variant) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-outline-variant) 1px, transparent 1px);
  background-size: 2rem 2rem;
  opacity: 0.26;
}
</style>
