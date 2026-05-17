<template>
  <header
    class="fixed top-0 right-0 z-40 w-[80%] border-b border-(--color-outline-variant) bg-(--color-background) px-6 py-3"
  >
    <div class="flex items-center gap-6">
      <div class="min-w-40"></div>

      <div class="group w-[clamp(260px,34vw,460px)] shrink-0">
        <FloatLabel variant="on">
          <IconField>
            <InputIcon
              :class="[
                searchLoading ? 'pi pi-spin pi-spinner' : 'pi pi-search',
                'text-lg! leading-none! text-(--color-search-icon)! transition-colors group-focus-within:text-(--color-primary)!',
              ]"
            />
            <InputText id="on_label" v-model="search" class="w-full rounded-[1.25rem]! border-2!" />
          </IconField>
          <label
            class="ml-0 max-w-[calc(100%-3rem)] truncate text-sm! font-normal! text-(--color-search-icon)! transition-colors group-focus-within:text-(--color-primary)!"
            for="on_label"
          >
            {{ t('header.searchLabel') }}
          </label>
        </FloatLabel>
      </div>

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

        <button
          class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-surface-container-high) text-xl text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:bg-(--color-surface-container-highest) hover:text-(--color-primary)"
          type="button"
          :aria-label="t('header.cart')"
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
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-(--color-outline-variant) bg-(--color-menu-active-bg) text-sm font-bold text-(--color-primary)"
          >
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="profileLabel"
              class="h-full w-full object-cover"
            />
            <span v-else>{{ userInitials }}</span>
          </span>

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
import { useAuth, useAuthDialog } from '@/modules/auth'
import { useUser } from '@/modules/user'
import { buildAssetUrl } from '@/shared/lib/url'
import { getUserDisplayName, getUserInitials } from '@/shared/lib/user'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const { isDark, toggleTheme } = useAppTheme()
const { openAuthDialog } = useAuthDialog()
const { isAuthenticated } = useAuth()
const { user } = useUser()

const search = ref('')
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined

const avatarUrl = computed(() =>
  buildAssetUrl(user.value?.avatar_url, import.meta.env.VITE_API_URL),
)
const profileName = computed(() => getUserDisplayName(user.value, t('profile.fallbackName')))
const profileLabel = computed(() => t('profile.openProfile', { name: profileName.value }))
const userInitials = computed(() => getUserInitials(user.value))

watch(search, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  if (!value.trim()) {
    searchLoading.value = false
    return
  }

  searchLoading.value = true
  searchTimer = setTimeout(() => {
    searchLoading.value = false
  }, 700)
})

const toggleLocale = () => {
  setLocale((locale.value === 'ru' ? 'en' : 'ru') as AppLocale)
}
</script>

<style scoped></style>
