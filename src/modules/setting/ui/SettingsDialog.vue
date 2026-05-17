<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :header="t('settings.title')"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :pt="dialogPassThrough"
  >
    <div class="flex min-h-100 gap-8 max-sm:min-h-128 max-sm:flex-col max-sm:gap-5">
      <nav
        class="flex w-60 shrink-0 flex-col gap-2 border-r border-(--color-outline-variant) pr-5 max-sm:w-full max-sm:border-r-0 max-sm:border-b max-sm:pb-4 max-sm:pr-0"
      >
        <button
          v-for="section in settingsSections"
          :key="section.id"
          type="button"
          :class="[
            settingsTabClass,
            activeSection === section.id
              ? 'bg-(--color-surface-container-highest) text-(--color-on-surface)'
              : 'bg-transparent text-(--color-on-surface-variant) hover:bg-(--color-surface-container-high)',
          ]"
          @click="setActiveSection(section.id)"
        >
          <span
            :class="[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl',
              activeSection === section.id
                ? 'bg-(--color-menu-active-bg) text-(--color-primary)'
                : 'text-(--color-on-surface-variant)',
            ]"
          >
            <i :class="section.icon" />
          </span>
          <span class="truncate">{{ t(section.titleKey) }}</span>
        </button>
      </nav>

      <section class="relative min-w-0 flex-1 overflow-hidden">
        <motion.div
          :key="activeSection"
          :initial="{ opacity: 0, x: 18 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.22, ease: 'easeOut' }"
          class="absolute inset-0"
        >
          <div v-if="activeSection === 'theme'" class="space-y-6">
            <h3 class="text-2xl font-semibold text-(--color-on-surface)">
              {{ t('settings.theme.title') }}
            </h3>

            <div class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="option in themeOptions"
                :key="option.value"
                type="button"
                :class="[
                  optionButtonClass,
                  theme === option.value
                    ? 'border-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary)'
                    : 'border-(--color-outline-variant) bg-(--color-surface-container-high) text-(--color-on-surface) hover:border-(--color-primary)',
                ]"
                @click="setTheme(option.value)"
              >
                <i :class="option.icon" class="text-2xl" />
                <span>{{ t(option.labelKey) }}</span>
              </button>
            </div>
          </div>

          <div v-else-if="activeSection === 'language'" class="space-y-6">
            <h3 class="text-2xl font-semibold text-(--color-on-surface)">
              {{ t('settings.language.title') }}
            </h3>

            <div class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="option in languageOptions"
                :key="option.value"
                type="button"
                :class="[
                  optionButtonClass,
                  locale === option.value
                    ? 'border-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary)'
                    : 'border-(--color-outline-variant) bg-(--color-surface-container-high) text-(--color-on-surface) hover:border-(--color-primary)',
                ]"
                @click="setLocale(option.value)"
              >
                <i class="pi pi-language text-2xl" />
                <span>{{ t(option.labelKey) }}</span>
              </button>
            </div>
          </div>

          <div v-else-if="activeSection === 'security'" class="space-y-6">
            <h3 class="text-2xl font-semibold text-(--color-on-surface)">
              {{ t('settings.security.title') }}
            </h3>

            <div class="space-y-3">
              <div
                class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-4"
              >
                <p class="font-semibold text-(--color-on-surface)">
                  {{ t('settings.security.password') }}
                </p>
              </div>
              <div
                class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-4"
              >
                <p class="font-semibold text-(--color-on-surface)">
                  {{ t('settings.security.sessions') }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="activeSection === 'admin' && props.canViewAdmin" class="space-y-6">
            <h3 class="text-2xl font-semibold text-(--color-on-surface)">
              {{ t('settings.admin.title') }}
            </h3>

            <div
              class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-4"
            >
              <p class="font-semibold text-(--color-on-surface)">
                {{ t('settings.admin.panel') }}
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { setLocale, type AppLocale } from '@/app/i18n'
import { useAppTheme, type AppTheme } from '@/app/theme/useAppTheme'
import { motion } from 'motion-v'
import Dialog from 'primevue/dialog'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type SettingsSection = 'theme' | 'language' | 'security' | 'admin'

type SettingsTab = {
  id: SettingsSection
  icon: string
  titleKey: string
}

type ThemeOption = {
  icon: string
  labelKey: string
  value: AppTheme
}

type LanguageOption = {
  labelKey: string
  value: AppLocale
}

const visible = defineModel<boolean>('visible', { required: true })
const props = withDefaults(
  defineProps<{
    canViewAdmin?: boolean
  }>(),
  {
    canViewAdmin: false,
  },
)
const { locale, t } = useI18n()
const { setTheme, theme } = useAppTheme()

const activeSection = ref<SettingsSection>('theme')

const settingsSections = computed<SettingsTab[]>(() => [
  { id: 'theme', icon: 'pi pi-palette', titleKey: 'settings.tabs.theme' },
  { id: 'language', icon: 'pi pi-language', titleKey: 'settings.tabs.language' },
  { id: 'security', icon: 'pi pi-shield', titleKey: 'settings.tabs.security' },
  ...(props.canViewAdmin
    ? ([{ id: 'admin', icon: 'pi pi-server', titleKey: 'settings.tabs.admin' }] as const)
    : []),
])

const themeOptions: ThemeOption[] = [
  { icon: 'pi pi-sun', labelKey: 'settings.theme.light', value: 'light' },
  { icon: 'pi pi-moon', labelKey: 'settings.theme.dark', value: 'dark' },
]

const languageOptions: LanguageOption[] = [
  { labelKey: 'settings.language.ru', value: 'ru' },
  { labelKey: 'settings.language.en', value: 'en' },
]

const settingsTabClass =
  'relative flex h-15 w-full cursor-pointer items-center gap-4 rounded-md px-5 text-left text-lg font-semibold transition-colors'

const optionButtonClass =
  'flex min-h-20 cursor-pointer items-center gap-4 rounded-md border p-4 text-left text-lg font-semibold transition-colors'

const dialogPassThrough = {
  root: {
    class:
      'overflow-hidden rounded-xl! border! border-(--color-outline-variant)! bg-(--color-surface-container)! text-(--color-on-surface)! shadow-2xl!',
  },
  header: {
    class: 'bg-(--color-surface-container)! px-8! pb-6! pt-8! text-(--color-on-surface)!',
  },
  title: {
    class: 'text-3xl! font-bold!',
  },
  content: {
    class: 'bg-(--color-surface-container)! px-8! pb-8! text-(--color-on-surface)!',
  },
  mask: {
    class: 'backdrop-blur-sm!',
  },
  closeButton: {
    class:
      'text-(--color-on-surface-variant)! hover:bg-(--color-surface-container-highest)! hover:text-(--color-on-surface)!',
  },
}

const setActiveSection = (section: SettingsSection): void => {
  activeSection.value = section
}

watch(
  () => props.canViewAdmin,
  (canViewAdmin) => {
    if (!canViewAdmin && activeSection.value === 'admin') {
      activeSection.value = 'theme'
    }
  },
)
</script>

<style scoped></style>
