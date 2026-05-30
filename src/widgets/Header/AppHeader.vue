<template>
  <header
    class="fixed top-0 right-0 z-40 w-[80%] border-b border-(--color-outline-variant) bg-(--color-background) px-6 py-3"
  >
    <div class="flex items-center gap-6">
      <div class="min-w-40"></div>

      <HeaderGameSearch />

      <div class="ml-auto flex items-center gap-5">
        <button
          class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-sm font-semibold text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) hover:text-(--color-primary)"
          type="button"
          :aria-label="t('header.switchLanguage')"
          @click="toggleLocale"
        >
          {{ t('header.language') }}
        </button>

        <button
          class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-xl text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) hover:text-(--color-primary)"
          type="button"
          :aria-label="isDark ? t('header.themeLight') : t('header.themeDark')"
          @click="toggleTheme"
        >
          <VueIcon :name="isDark ? 'bs:sun-fill' : 'bs:moon-stars-fill'" />
        </button>

        <button
          class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-xl text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) hover:text-(--color-primary)"
          type="button"
          :aria-label="t('header.notifications')"
        >
          <VueIcon name="bs:bell" />
        </button>

        <RouterLink
          v-if="isAuthenticated"
          to="/basket"
          :class="cartButtonClass"
          :aria-label="cartLabel"
        >
          <VueIcon name="bs:basket-3-fill" />
          <AnimatePresence mode="popLayout">
            <motion.span
              v-if="basketCount > 0"
              :key="basketCount"
              class="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-(--color-background) bg-(--color-primary) px-1 text-[0.7rem] leading-none font-extrabold text-(--color-on-primary) shadow-[0_6px_16px_rgb(189_0_255/0.35)]"
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -10 }"
              :transition="{ duration: 0.18, ease: 'easeOut' }"
            >
              {{ displayBasketCount }}
            </motion.span>
          </AnimatePresence>
        </RouterLink>

        <button
          v-else
          :class="cartButtonClass"
          type="button"
          :aria-label="t('header.cart')"
          @click="requestAuthPrompt()"
        >
          <VueIcon name="bs:basket-3-fill" />
        </button>

        <Button
          v-if="!isAuthenticated"
          :label="t('header.login')"
          @click="openAuthDialog('login')"
        />
        <RouterLink
          v-else
          to="/profile"
          class="group/profile flex h-12 max-w-70 min-w-0 items-center gap-3 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) py-1.5 pr-3 pl-1.5 text-left text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) hover:text-(--color-primary)"
          :aria-label="profileLabel"
        >
          <UserAvatar
            :src="avatarUrl"
            :alt="profileLabel"
            :fallback="userInitials"
            class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-(--color-outline-variant) bg-(--color-menu-active-bg) text-sm font-bold text-(--color-primary)"
          />

          <span class="hidden min-w-0 flex-col leading-tight min-[1180px]:flex">
            <span class="truncate text-sm font-semibold">{{ profileName }}</span>
            <span
              class="truncate text-xs text-(--color-on-surface-variant) group-hover/profile:text-(--color-primary)"
            >
              {{ user?.email }}
            </span>
          </span>

          <VueIcon name="bs:chevron-right" class="hidden shrink-0 text-sm min-[1180px]:block" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { setLocale, type AppLocale } from '@/app/i18n'
import { useAppTheme } from '@/app/theme/useAppTheme'
import { useAuth, useAuthDialog, useAuthPrompt } from '@/modules/auth'
import { HeaderGameSearch } from '@/modules/game'
import { useUser } from '@/modules/user'
import { buildAssetUrl } from '@/shared/lib/url'
import { getUserDisplayName, getUserInitials } from '@/shared/lib/user'
import { UserAvatar } from '@/shared/ui'
import { useBasketBadge } from '@/widgets/Header/composables/useBasketBadge'
import { AnimatePresence, motion } from 'motion-v'
import Button from 'primevue/button'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const { isDark, toggleTheme } = useAppTheme()
const { openAuthDialog } = useAuthDialog()
const { requestAuthPrompt } = useAuthPrompt()
const { isAuthenticated } = useAuth()
const { basketCount, cartLabel, displayBasketCount } = useBasketBadge()
const { user } = useUser()

const avatarUrl = computed(() =>
  buildAssetUrl(user.value?.avatar_url, import.meta.env.VITE_API_URL),
)
const profileName = computed(() => getUserDisplayName(user.value, t('profile.fallbackName')))
const profileLabel = computed(() => t('profile.openProfile', { name: profileName.value }))
const userInitials = computed(() => getUserInitials(user.value))
const cartButtonClass =
  'relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-xl text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) hover:text-(--color-primary)'

const toggleLocale = () => {
  setLocale((locale.value === 'ru' ? 'en' : 'ru') as AppLocale)
}
</script>

<style scoped></style>
