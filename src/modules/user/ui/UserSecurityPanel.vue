<template>
  <motion.section
    class="min-w-0 overflow-hidden rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-4 text-(--color-on-surface) shadow-sm min-[560px]:p-6"
    :initial="{ opacity: 0, x: 22 }"
    :animate="{ opacity: 1, x: 0 }"
    :transition="{ duration: 0.34, ease: 'easeOut', delay: 0.1 }"
  >
    <div class="mb-5 flex min-w-0 items-center gap-4">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-xl text-(--color-primary)"
      >
        <VueIcon name="bs:shield-lock" />
      </span>
      <h2 class="min-w-0 text-2xl leading-tight font-bold break-words">
        {{ t('profile.security.title') }}
      </h2>
    </div>

    <div
      class="flex min-w-0 items-center justify-between gap-4 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) p-4"
    >
      <span class="flex min-w-0 items-start gap-3">
        <span
          class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--color-surface-container-highest) text-(--color-primary)"
        >
          <i class="pi pi-google text-base" />
        </span>
        <span class="min-w-0">
          <span class="block text-sm leading-5 font-bold break-words">
            {{ t('profile.security.googleTitle') }}
          </span>
          <span class="mt-1 block text-xs leading-5 break-words text-(--color-on-surface-variant)">
            {{ googleDescription }}
          </span>
          <span
            :class="[
              'mt-3 inline-flex min-h-7 max-w-full items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold break-words',
              isGoogleLinked
                ? 'bg-(--color-menu-active-bg) text-(--color-primary)'
                : 'bg-(--color-surface-container-highest) text-(--color-on-surface-variant)',
            ]"
          >
            <VueIcon :name="isGoogleLinked ? 'bs:check-circle' : 'bs:dash-circle'" />
            <span class="min-w-0">{{ googleStatus }}</span>
          </span>
          <span
            v-if="isGoogleLocked"
            class="mt-3 block text-xs leading-5 break-words text-(--color-on-surface-variant)"
          >
            {{ t('profile.security.googlePasswordRequired') }}
          </span>
        </span>
      </span>
      <button
        type="button"
        role="switch"
        :aria-checked="isGoogleLinked"
        :aria-label="googleToggleLabel"
        :title="googleToggleLabel"
        :disabled="isGoogleUpdating || isGoogleLocked"
        class="relative h-8 w-14 shrink-0 cursor-pointer rounded-full border border-(--color-outline-variant) p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        :class="isGoogleLinked ? 'bg-(--color-primary)' : 'bg-(--color-surface-container-highest)'"
        @click="handleGoogleToggle"
      >
        <span
          class="flex h-6 w-6 items-center justify-center rounded-full bg-(--color-surface) text-[0.65rem] text-(--color-primary) shadow-sm transition-transform"
          :class="isGoogleLinked ? 'translate-x-6' : 'translate-x-0'"
        >
          <i v-if="isGoogleUpdating" class="pi pi-spin pi-spinner" />
          <VueIcon v-else :name="isGoogleLinked ? 'bs:check2' : 'bs:plus'" />
        </span>
      </button>
    </div>
  </motion.section>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  connectGoogle: []
  disconnectGoogle: []
}>()

const props = defineProps<{
  hasPassword: boolean
  isGoogleLinked: boolean
  isGoogleUpdating: boolean
}>()

const { t } = useI18n()

const isGoogleLocked = computed(() => props.isGoogleLinked && !props.hasPassword)

const googleDescription = computed(() => {
  if (isGoogleLocked.value) {
    return t('profile.security.googleLockedDescription')
  }

  return props.isGoogleLinked
    ? t('profile.security.googleDisconnectDescription')
    : t('profile.security.googleConnectDescription')
})

const googleStatus = computed(() =>
  props.isGoogleLinked
    ? t('profile.security.googleConnected')
    : t('profile.security.googleDisconnected'),
)

const googleToggleLabel = computed(() =>
  props.isGoogleLinked
    ? t('profile.security.googleToggleOff')
    : t('profile.security.googleToggleOn'),
)

const handleGoogleToggle = (): void => {
  if (props.isGoogleUpdating || isGoogleLocked.value) {
    return
  }

  if (props.isGoogleLinked) {
    emit('disconnectGoogle')
    return
  }

  emit('connectGoogle')
}
</script>
