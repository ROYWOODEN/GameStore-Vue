<template>
  <aside
    class="fixed top-0 left-0 z-50 hidden h-full w-[20%] flex-col border-r border-(--color-sidebar-border) bg-(--color-sidebar) py-3 lg:flex"
  >
    <RouterLink to="/" class="flex w-full justify-center px-6" aria-label="GameStore">
      <img src="/logo.svg" alt="" class="max-h-20 w-auto object-contain" />
    </RouterLink>

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

  <nav
    class="fixed right-0 bottom-0 left-0 z-50 grid grid-cols-5 gap-1 border-t border-(--color-sidebar-border) bg-(--color-sidebar)/96 px-1.5 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] shadow-[0_-14px_36px_rgb(0_0_0/0.16)] backdrop-blur lg:hidden"
    :aria-label="t('sidebar.more')"
    :style="mobileIndicatorStyle"
  >
    <span
      class="mobile-nav-indicator pointer-events-none absolute top-1.5 bottom-[calc(env(safe-area-inset-bottom)+0.35rem)] left-1.5 rounded-md bg-(--color-menu-active-bg)"
    />

    <RouterLink
      v-for="(item, index) in menuItemsBar"
      :key="item.titleKey"
      :to="item.to"
      custom
      v-slot="{ href, navigate }"
    >
      <a
        :href="href"
        :aria-current="route.path === item.to ? 'page' : undefined"
        :class="[
          mobileNavBaseClass,
          activeMobileIndex === index ? mobileNavActiveClass : mobileNavIdleClass,
        ]"
        @click.prevent="handleMobileNavClick(item.to, navigate)"
      >
        <span class="text-[1.35rem] leading-none">
          <VueIcon :name="item.icon" />
        </span>
        <span class="max-w-full truncate">{{ t(item.titleKey) }}</span>
      </a>
    </RouterLink>

    <button
      type="button"
      :class="[
        mobileNavBaseClass,
        activeMobileIndex === moreMenuIndex ? mobileNavActiveClass : mobileNavIdleClass,
      ]"
      :aria-expanded="isMobileMenuOpen"
      :aria-label="isMobileMenuOpen ? t('sidebar.closeMenu') : t('sidebar.openMenu')"
      @click="toggleMobileMenu"
    >
      <span class="text-[1.35rem] leading-none">
        <VueIcon :name="isMobileMenuOpen ? 'bs:x-lg' : 'bs:list'" />
      </span>
      <span class="max-w-full truncate">{{ t('sidebar.more') }}</span>
    </button>
  </nav>

  <AnimatePresence>
    <motion.div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-[60] lg:hidden"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.18, ease: 'easeOut' }"
    >
      <button
        class="absolute inset-0 h-full w-full cursor-default bg-black/45"
        type="button"
        :aria-label="t('sidebar.closeMenu')"
        @click="handleCloseMobileMenuClick"
      />

      <motion.div
        class="absolute right-0 bottom-0 left-0 max-h-[82vh] overflow-y-auto rounded-t-md border border-(--color-outline-variant) bg-(--color-surface-container-lowest) px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] shadow-[0_-24px_64px_rgb(0_0_0/0.34)]"
        role="dialog"
        :aria-label="t('sidebar.more')"
        :initial="{ y: 36, opacity: 0, scale: 0.98 }"
        :animate="{ y: 0, opacity: 1, scale: 1 }"
        :exit="{ y: 36, opacity: 0, scale: 0.98 }"
        :transition="{ duration: 0.2, ease: 'easeOut' }"
      >
        <div class="mx-auto mb-3 h-1 w-11 rounded-full bg-(--color-outline-variant)" />

        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <UserAvatar
              v-if="isAuthenticated"
              :src="avatarUrl"
              :alt="profileLabel"
              :fallback="userInitials"
              class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-(--color-outline-variant) bg-(--color-menu-active-bg) text-sm font-bold text-(--color-primary)"
            />
            <span v-else class="flex h-12 w-28 shrink-0 items-center overflow-hidden">
              <img src="/logo.svg" alt="" class="h-10 w-auto object-contain" />
            </span>

            <span class="grid min-w-0 gap-0.5">
              <span class="truncate text-base font-extrabold text-(--color-on-surface)">
                {{ isAuthenticated ? profileName : t('header.login') }}
              </span>
              <span
                v-if="isAuthenticated"
                class="truncate text-xs font-semibold text-(--color-on-surface-variant)"
              >
                {{ user?.email }}
              </span>
            </span>
          </div>

          <button
            class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
            type="button"
            :aria-label="t('sidebar.closeMenu')"
            @click="handleCloseMobileMenuClick"
          >
            <VueIcon name="bs:x-lg" />
          </button>
        </div>

        <div class="mt-5 grid gap-2">
          <RouterLink
            v-if="isAuthenticated"
            to="/profile"
            :class="sheetActionClass"
            @click="closeMobileMenu"
          >
            <VueIcon name="bs:person-circle" class="text-xl text-(--color-primary)" />
            <span>{{ t('profile.fallbackName') }}</span>
          </RouterLink>
          <button v-else :class="sheetActionClass" type="button" @click="handleLoginClick">
            <VueIcon name="bs:person-circle" class="text-xl text-(--color-primary)" />
            <span>{{ t('header.login') }}</span>
          </button>

          <RouterLink
            v-if="isAuthenticated"
            to="/basket"
            :class="sheetActionClass"
            :aria-label="cartLabel"
            @click="closeMobileMenu"
          >
            <span class="relative flex text-xl text-(--color-primary)">
              <VueIcon name="bs:basket-3-fill" />
              <span
                v-if="basketCount > 0"
                class="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--color-primary) px-1 text-[0.62rem] leading-none font-extrabold text-(--color-on-primary)"
              >
                {{ displayBasketCount }}
              </span>
            </span>
            <span>{{ t('header.cart') }}</span>
          </RouterLink>
          <button
            v-else
            :class="sheetActionClass"
            type="button"
            :aria-label="t('header.cart')"
            @click="handleCartAuthClick"
          >
            <VueIcon name="bs:basket-3-fill" class="text-xl text-(--color-primary)" />
            <span>{{ t('header.cart') }}</span>
          </button>

          <button :class="sheetActionClass" type="button" @click="openSettings">
            <VueIcon name="ca:settings" class="text-xl text-(--color-primary)" />
            <span>{{ t('sidebar.settings') }}</span>
          </button>

          <button :class="sheetActionClass" type="button" :aria-label="t('header.notifications')">
            <VueIcon name="bs:bell" class="text-xl text-(--color-primary)" />
            <span>{{ t('header.notifications') }}</span>
          </button>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            class="grid min-h-18 cursor-pointer gap-1 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-3 text-left transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
            type="button"
            :aria-label="t('profile.preferences.toggleTheme')"
            @click="toggleTheme"
          >
            <VueIcon
              :name="isDark ? 'bs:moon-stars-fill' : 'bs:sun-fill'"
              class="text-xl text-(--color-primary)"
            />
            <span class="text-xs font-bold text-(--color-on-surface-variant)">
              {{ t('profile.preferences.theme') }}
            </span>
            <span class="truncate text-sm font-extrabold text-(--color-on-surface)">
              {{ isDark ? t('settings.theme.dark') : t('settings.theme.light') }}
            </span>
          </button>

          <button
            class="grid min-h-18 cursor-pointer gap-1 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-3 text-left transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
            type="button"
            :aria-label="t('header.switchLanguage')"
            @click="toggleLocale"
          >
            <VueIcon name="bs:translate" class="text-xl text-(--color-primary)" />
            <span class="text-xs font-bold text-(--color-on-surface-variant)">
              {{ t('profile.preferences.language') }}
            </span>
            <span class="truncate text-sm font-extrabold text-(--color-on-surface)">
              {{ languageLabel }}
            </span>
          </button>
        </div>

        <button
          v-if="isAuthenticated"
          class="mt-3 flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md border border-[color-mix(in_srgb,var(--color-error)_56%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_9%,var(--color-surface-container-lowest))] px-4 text-left text-sm font-extrabold text-(--color-error) transition-colors hover:border-(--color-error) hover:bg-[color-mix(in_srgb,var(--color-error)_14%,var(--color-surface-container-lowest))]"
          type="button"
          @click="handleLogoutClick"
        >
          <VueIcon name="ra:exit" class="text-xl" />
          <span>{{ t('sidebar.exit') }}</span>
        </button>
      </motion.div>
    </motion.div>
  </AnimatePresence>

  <SettingsDialog v-model:visible="settingsVisible" :can-view-admin="user?.role === 'admin'" />
</template>

<script setup lang="ts">
import { setLocale, type AppLocale } from '@/app/i18n'
import { useAppTheme } from '@/app/theme/useAppTheme'
import { useAuth, useAuthDialog, useAuthPrompt } from '@/modules/auth'
import { useBasket } from '@/modules/basket'
import { useFavorites } from '@/modules/favorite'
import { useLibrary } from '@/modules/library'
import { useCheckoutPayment } from '@/modules/payment'
import { SettingsDialog } from '@/modules/setting'
import { useUser } from '@/modules/user'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { buildAssetUrl } from '@/shared/lib/url'
import { getUserDisplayName, getUserInitials } from '@/shared/lib/user'
import { UserAvatar } from '@/shared/ui'
import { useBasketBadge } from '@/widgets/Header/composables/useBasketBadge'
import { AnimatePresence, motion } from 'motion-v'
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { clearCurrentUser, user } = useUser()

const route = useRoute()
const { isAuthenticated } = useAuth()
const { openAuthDialog } = useAuthDialog()
const { requestAuthPrompt } = useAuthPrompt()
const { showApiError } = useApiErrorToast()
const { locale, t } = useI18n()
const { isDark, toggleTheme } = useAppTheme()
const { logout } = useAuth()
const { clearFavorites } = useFavorites()
const { clearBasketState } = useBasket()
const { clearLibraryState } = useLibrary()
const { clearPaymentState } = useCheckoutPayment()
const { basketCount, cartLabel, displayBasketCount } = useBasketBadge()
const settingsVisible = ref<boolean>(false)
const isMobileMenuOpen = ref(false)
const pendingMobileIndex = ref<number | null>(null)

type BottomMenuItemId = 'settings' | 'exit'
type BottomMenuItem = {
  id: BottomMenuItemId
  titleKey: string
  icon: string
  variant?: 'danger'
}

const menuItemsBar: { to: string; titleKey: string; icon: string }[] = [
  {
    to: '/',
    titleKey: 'sidebar.main',
    icon: 'fl:home',
  },
  { to: '/catalog', titleKey: 'sidebar.catalog', icon: 'an:outlined-appstore' },
  { to: '/favorites', titleKey: 'sidebar.favorites', icon: 'bs:heart' },
  { to: '/library', titleKey: 'sidebar.library', icon: 'co:library' },
]
const moreMenuIndex = menuItemsBar.length

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

const mobileNavBaseClass =
  'relative z-10 flex h-14 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-1 text-center text-[0.68rem] font-extrabold leading-none transition-colors'

const mobileNavActiveClass = 'text-(--color-primary)'

const mobileNavIdleClass = 'text-(--color-on-surface-variant) hover:text-(--color-primary)'

const sheetActionClass =
  'flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-4 text-left text-sm font-extrabold text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)'

const avatarUrl = computed(() =>
  buildAssetUrl(user.value?.avatar_url, import.meta.env.VITE_API_URL),
)
const profileName = computed(() => getUserDisplayName(user.value, t('profile.fallbackName')))
const profileLabel = computed(() => t('profile.openProfile', { name: profileName.value }))
const userInitials = computed(() => getUserInitials(user.value))
const languageLabel = computed(() =>
  locale.value === 'ru' ? t('settings.language.ru') : t('settings.language.en'),
)
const activeMobileIndex = computed(() => {
  if (pendingMobileIndex.value !== null) {
    return pendingMobileIndex.value
  }

  if (isMobileMenuOpen.value) {
    return moreMenuIndex
  }

  if (route.path === '/') {
    return 0
  }

  if (route.path === '/catalog' || route.path === '/search' || route.path.startsWith('/games/')) {
    return 1
  }

  if (route.path === '/favorites') {
    return 2
  }

  if (route.path === '/library') {
    return 3
  }

  if (route.path === '/basket' || route.path === '/profile' || route.path.startsWith('/admin')) {
    return moreMenuIndex
  }

  return null
})
const mobileIndicatorStyle = computed(() => ({
  '--mobile-nav-index': activeMobileIndex.value ?? 0,
  '--mobile-nav-opacity': activeMobileIndex.value === null ? 0 : 1,
}))

const getMobileIndexByRoute = (target: string): number => {
  const index = menuItemsBar.findIndex((item) => item.to === target)
  return index >= 0 ? index : moreMenuIndex
}

const setActiveMobileIndex = (target: string): void => {
  pendingMobileIndex.value = getMobileIndexByRoute(target)
}

const waitForNextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })

const handleMobileNavClick = async (
  target: string,
  navigate: () => Promise<unknown> | unknown,
): Promise<void> => {
  setActiveMobileIndex(target)
  closeMobileMenu(false)

  await nextTick()
  await waitForNextFrame()

  try {
    await navigate()
  } finally {
    pendingMobileIndex.value = null
  }
}

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
    clearLibraryState()
    clearPaymentState()
  } catch (error: unknown) {
    showApiError(error)
  }
}

const toggleMobileMenu = (): void => {
  const nextValue = !isMobileMenuOpen.value
  pendingMobileIndex.value = nextValue ? moreMenuIndex : null
  isMobileMenuOpen.value = nextValue
}

const closeMobileMenu = (clearPendingIndex = true): void => {
  isMobileMenuOpen.value = false

  if (clearPendingIndex) {
    pendingMobileIndex.value = null
  }
}

const handleCloseMobileMenuClick = (): void => {
  closeMobileMenu()
}

const openSettings = (): void => {
  closeMobileMenu()
  settingsVisible.value = true
}

const handleLoginClick = (): void => {
  closeMobileMenu()
  openAuthDialog('login')
}

const handleCartAuthClick = (): void => {
  closeMobileMenu()
  requestAuthPrompt()
}

const handleLogoutClick = async (): Promise<void> => {
  closeMobileMenu()
  await handleLogout()
}

const toggleLocale = (): void => {
  setLocale((locale.value === 'ru' ? 'en' : 'ru') as AppLocale)
}

watch(
  () => route.fullPath,
  () => {
    pendingMobileIndex.value = null
    closeMobileMenu()
  },
)
</script>

<style scoped>
.mobile-nav-indicator {
  width: calc((100% - 0.75rem - 1rem) / 5);
  opacity: var(--mobile-nav-opacity);
  transform: translateX(calc(var(--mobile-nav-index) * (100% + 0.25rem)));
  transition:
    transform 150ms cubic-bezier(0.2, 0, 0, 1),
    opacity 120ms ease-out;
  will-change: transform;
}
</style>
