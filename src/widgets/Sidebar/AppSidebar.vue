<template>
  <aside
    class="fixed left-0 top-0 flex h-full w-[20%] flex-col border-r border-(--color-sidebar-border) bg-(--color-sidebar) py-3"
  >
    <div class="flex w-full justify-center px-6">
      <img src="/logo.svg" alt="" />
    </div>

    <nav class="mt-8 flex w-full flex-col gap-1">
      <RouterLink
        v-for="item in menuItemsBar"
        :key="item.title"
        :to="item.to"
        custom
        v-slot="{ href, navigate }"
      >
        <a
          :href="href"
          :aria-current="route.path === item.to ? 'page' : undefined"
          :class="[
            menuLinkBaseClass,
            route.path === item.to ? menuLinkActiveClass : menuLinkIdleClass,
          ]"
          @click="navigate"
        >
          <span class="text-3xl text-current transition-colors">
            <VueIcon :name="item.icon" />
          </span>
          <span>{{ item.title }}</span>
        </a>
      </RouterLink>
    </nav>

    <nav class="mt-auto flex w-full flex-col gap-1 border-t border-(--color-sidebar-border) pt-3">
      <button
        v-for="item in bottomMenuItems"
        :key="item.title"
        :class="[
          menuLinkBaseClass,
          item.variant === 'danger' ? dangerLinkIdleClass : menuLinkIdleClass,
        ]"
        type="button"
      >
        <span class="text-3xl text-current transition-colors">
          <VueIcon :name="item.icon" />
        </span>
        <span>{{ item.title }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { useRoute, type RouteLocationRaw } from 'vue-router'

const route = useRoute()

const menuItemsBar: { to: RouteLocationRaw; title: string; icon: string }[] = [
  {
    to: '/',
    title: 'Main',
    icon: 'fl:home',
  },
  { to: '/catalog', title: 'Catalog', icon: 'an:outlined-appstore' },
  { to: '/favorites', title: 'Favorites', icon: 'bs:heart' },
  { to: '/library', title: 'Library', icon: 'co:library' },
]

const bottomMenuItems: {
  title: string
  icon: string
  variant?: 'danger'
}[] = [
  { title: 'Setting', icon: 'ca:settings' },
  { title: 'Exit', icon: 'ra:exit', variant: 'danger' },
]

const menuLinkBaseClass =
  'group flex min-h-16 cursor-pointer items-center gap-5 border-l-4 px-8 text-left text-xl font-semibold transition-colors'

const menuLinkActiveClass =
  'border-l-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary)'

const menuLinkIdleClass =
  'border-transparent bg-transparent text-(--color-on-surface-variant) hover:border-l-(--color-primary) hover:bg-(--color-menu-hover-bg) hover:text-(--color-primary)'

const dangerLinkIdleClass =
  'border-transparent bg-transparent text-(--color-on-surface-variant) hover:border-l-(--color-error) hover:bg-(--color-menu-danger-hover-bg) hover:text-(--color-error)'
</script>

<style scoped></style>
