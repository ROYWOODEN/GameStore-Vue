<template>
  <aside
    class="fixed left-0 top-0 z-50 flex h-full w-[20%] flex-col border-r border-(--color-sidebar-border) bg-(--color-sidebar) py-3"
  >
    <div class="flex w-full justify-center px-6">
      <img src="/logo.svg" alt="" />
    </div>

    <nav class="mt-8 flex w-full flex-col gap-1">
      <RouterLink
        v-for="item in menuItemsBar"
        :key="item.titleKey"
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
          <span>{{ t(item.titleKey) }}</span>
        </a>
      </RouterLink>
    </nav>

    <nav class="mt-auto flex w-full flex-col gap-1 border-t border-(--color-sidebar-border) pt-3">
      <button
        v-for="item in bottomMenuItems"
        :key="item.titleKey"
        :class="[
          menuLinkBaseClass,
          item.variant === 'danger' ? dangerLinkIdleClass : menuLinkIdleClass,
        ]"
        type="button"
        @click="handleBottomMenuClick(item.id)"
      >
        <span class="text-3xl text-current transition-colors">
          <VueIcon :name="item.icon" />
        </span>
        <span>{{ t(item.titleKey) }}</span>
      </button>
    </nav>
  </aside>
  <SettingsDialog v-model:visible="settingsVisible" :can-view-admin="user?.role === 'admin'" />
</template>

<script setup lang="ts">
import { useAuth } from '@/modules/auth'
import { useBasket } from '@/modules/basket'
import { useFavorites } from '@/modules/favorite'
import { useCheckoutPayment } from '@/modules/payment'
import { SettingsDialog } from '@/modules/setting'
import { useUser } from '@/modules/user'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, type RouteLocationRaw } from 'vue-router'

const { clearCurrentUser, user } = useUser()

const route = useRoute()
const { isAuthenticated } = useAuth()
const { showApiError } = useApiErrorToast()
const { t } = useI18n()
const { logout } = useAuth()
const { clearFavorites } = useFavorites()
const { clearBasketState } = useBasket()
const { clearPaymentState } = useCheckoutPayment()
const settingsVisible = ref<boolean>(false)

type BottomMenuItemId = 'settings' | 'exit'
type BottomMenuItem = {
  id: BottomMenuItemId
  titleKey: string
  icon: string
  variant?: 'danger'
}

const menuItemsBar: { to: RouteLocationRaw; titleKey: string; icon: string }[] = [
  {
    to: '/',
    titleKey: 'sidebar.main',
    icon: 'fl:home',
  },
  { to: '/catalog', titleKey: 'sidebar.catalog', icon: 'an:outlined-appstore' },
  { to: '/favorites', titleKey: 'sidebar.favorites', icon: 'bs:heart' },
  { to: '/library', titleKey: 'sidebar.library', icon: 'co:library' },
]

const bottomMenuItems = computed<BottomMenuItem[]>(() => [
  { id: 'settings', titleKey: 'sidebar.settings', icon: 'ca:settings' },
  ...(isAuthenticated.value
    ? ([{ id: 'exit', titleKey: 'sidebar.exit', icon: 'ra:exit', variant: 'danger' }] as const)
    : []),
])

const menuLinkBaseClass =
  'group flex min-h-16 cursor-pointer items-center gap-5 border-l-4 px-8 text-left text-xl font-semibold transition-colors'

const menuLinkActiveClass =
  'border-l-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary)'

const menuLinkIdleClass =
  'border-transparent bg-transparent text-(--color-on-surface-variant) hover:border-l-(--color-primary) hover:bg-(--color-menu-hover-bg) hover:text-(--color-primary)'

const dangerLinkIdleClass =
  'border-transparent bg-transparent text-(--color-on-surface-variant) hover:border-l-(--color-error) hover:bg-(--color-menu-danger-hover-bg) hover:text-(--color-error)'

const handleBottomMenuClick = (itemId: BottomMenuItemId): void => {
  if (itemId === 'settings') {
    settingsVisible.value = true
  } else {
    handleLogout()
  }
}
const handleLogout = async (): Promise<void> => {
  try {
    await logout()
    clearCurrentUser()
    clearFavorites()
    clearBasketState()
    clearPaymentState()
  } catch (error: unknown) {
    showApiError(error)
  }
}
</script>

<style scoped></style>
