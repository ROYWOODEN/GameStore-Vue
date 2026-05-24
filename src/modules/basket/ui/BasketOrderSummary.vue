<template>
  <aside
    class="rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-low) p-5 text-(--color-on-surface) shadow-[0_14px_34px_rgb(0_0_0/0.12)]"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold">{{ t('basketPage.summaryTitle') }}</h2>
        <p class="mt-1 text-sm text-(--color-on-surface-variant)">
          {{ t('basketPage.summarySubtitle', { count, total: totalCount }) }}
        </p>
      </div>
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-(--color-outline-variant) bg-(--color-menu-active-bg) text-xl text-(--color-primary)"
        aria-hidden="true"
      >
        <VueIcon name="bs:basket-3-fill" />
      </div>
    </div>

    <div class="mt-6 space-y-4 border-b border-(--color-outline-variant) pb-5">
      <div class="flex items-center justify-between gap-4 text-sm">
        <span class="text-(--color-on-surface-variant)">
          {{ t('basketPage.itemsLabel', { count }) }}
        </span>
        <span class="font-semibold">{{ formattedTotal }}</span>
      </div>
      <div class="flex items-center justify-between gap-4 text-sm">
        <span class="text-(--color-on-surface-variant)">{{ t('basketPage.deliveryLabel') }}</span>
        <span class="font-semibold">{{ t('basketPage.deliveryValue') }}</span>
      </div>
    </div>

    <div class="mt-5 flex items-end justify-between gap-4">
      <span class="text-lg font-bold">{{ t('basketPage.total') }}</span>
      <span class="min-w-0 text-right text-2xl font-extrabold text-(--color-primary)">
        {{ formattedTotal }}
      </span>
    </div>

    <div class="mt-6 grid gap-3">
      <button
        :class="[
          'flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-(--color-primary) bg-(--color-primary) px-4 text-sm font-bold text-(--color-on-primary) transition-colors hover:border-(--color-primary-strong) hover:bg-(--color-primary-strong) disabled:opacity-75',
          isCheckoutLoading
            ? 'cursor-wait'
            : count === 0 || isClearing
              ? 'cursor-not-allowed'
              : 'cursor-pointer',
        ]"
        type="button"
        :disabled="isClearing || isCheckoutLoading || count === 0"
        @click="emit('checkout')"
      >
        <AnimatePresence mode="wait">
          <motion.span
            :key="isCheckoutLoading ? 'paying' : 'pay'"
            class="flex"
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -8 }"
            :transition="{ duration: 0.16, ease: 'easeOut' }"
          >
            <i v-if="isCheckoutLoading" class="pi pi-spin pi-spinner text-base" />
            <VueIcon v-else name="bs:credit-card" class="text-base" />
          </motion.span>
        </AnimatePresence>
        <span>{{ isCheckoutLoading ? t('basketPage.paying') : t('basketPage.pay') }}</span>
      </button>

      <button
        :class="[
          'flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-error)_62%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_12%,var(--color-surface-container-high))] px-4 text-sm font-bold text-(--color-error) transition-colors hover:border-(--color-error) hover:bg-[color-mix(in_srgb,var(--color-error)_18%,var(--color-surface-container-high))] disabled:opacity-75',
          isClearing
            ? 'cursor-wait'
            : isCheckoutLoading || totalCount === 0
              ? 'cursor-not-allowed'
              : 'cursor-pointer',
        ]"
        type="button"
        :disabled="isClearing || isCheckoutLoading || totalCount === 0"
        @click="emit('clear')"
      >
        <AnimatePresence mode="wait">
          <motion.span
            :key="isClearing ? 'clearing' : 'clear'"
            class="flex"
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -8 }"
            :transition="{ duration: 0.16, ease: 'easeOut' }"
          >
            <i v-if="isClearing" class="pi pi-spin pi-spinner text-base" />
            <VueIcon v-else name="bs:trash3" class="text-base" />
          </motion.span>
        </AnimatePresence>
        <span>{{ isClearing ? t('basketPage.clearing') : t('basketPage.clear') }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { formatRubPrice } from '@/shared/lib/price'
import { AnimatePresence, motion } from 'motion-v'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  count: number
  isCheckoutLoading: boolean
  isClearing: boolean
  totalCount: number
  totalAmount: string
}>()

const emit = defineEmits<{
  checkout: []
  clear: []
}>()

const { t } = useI18n()
const formattedTotal = computed(() => formatRubPrice(props.totalAmount))
</script>
