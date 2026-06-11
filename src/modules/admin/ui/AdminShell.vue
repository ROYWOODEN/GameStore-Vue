<template>
  <main
    class="min-h-[calc(100vh-5rem)] bg-(--color-background) px-6 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-16"
  >
    <div class="mx-auto grid max-w-7xl gap-6">
      <motion.header
        class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5 shadow-sm min-[860px]:flex min-[860px]:items-end min-[860px]:justify-between min-[860px]:gap-6"
        :initial="{ opacity: 0, y: 18 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.26, ease: 'easeOut' }"
      >
        <div class="min-w-0">
          <div class="mb-3 flex items-center gap-3 text-(--color-primary)">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-(--color-primary) bg-(--color-surface-container-high) text-xl"
            >
              <VueIcon name="md:sharp-admin-panel-settings" />
            </span>
            <span class="text-xs font-bold tracking-[0.18em] uppercase">
              {{ t('admin.shell.eyebrow') }}
            </span>
          </div>
          <h1 class="text-3xl font-extrabold text-(--color-on-surface)">
            {{ t('admin.shell.title') }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-(--color-on-surface-variant)">
            {{ t('admin.shell.description') }}
          </p>
        </div>

        <nav class="mt-5 flex flex-wrap gap-2 min-[860px]:mt-0" :aria-label="t('admin.shell.aria')">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              navLinkClass,
              isActive(item.to)
                ? 'border-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary)'
                : 'border-(--color-outline-variant) bg-(--color-surface-container-high) text-(--color-on-surface-variant) hover:border-(--color-primary) hover:text-(--color-primary)',
            ]"
          >
            <VueIcon :name="item.icon" />
            <span>{{ t(item.labelKey) }}</span>
          </RouterLink>
        </nav>
      </motion.header>

      <slot />
    </div>
  </main>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const route = useRoute()
const { t } = useI18n()

const navItems = [
  { to: '/admin/games', labelKey: 'admin.shell.nav.games', icon: 'bs:controller' },
  { to: '/admin/games/new', labelKey: 'admin.shell.nav.newGame', icon: 'bs:plus-circle' },
  { to: '/admin/tags', labelKey: 'admin.shell.nav.tags', icon: 'bs:tags' },
]

const navLinkClass =
  'inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-bold transition-colors'

const isActive = (path: string): boolean => {
  return route.path === path || (path === '/admin/games' && route.path === '/admin')
}
</script>
