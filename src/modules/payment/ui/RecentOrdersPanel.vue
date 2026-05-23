<template>
  <section
    class="min-w-0 rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-low) p-5 text-(--color-on-surface) shadow-[0_14px_34px_rgb(0_0_0/0.1)]"
  >
    <div class="flex min-w-0 items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-xl font-extrabold">{{ t('payment.recent.title') }}</h2>
        <p class="mt-1 text-sm leading-5 text-(--color-on-surface-variant)">
          {{ t('payment.recent.subtitle') }}
        </p>
      </div>
      <Button
        text
        rounded
        class="h-12! w-12! min-w-12! p-0! text-(--color-on-surface-variant)! hover:text-(--color-primary)!"
        type="button"
        :aria-label="t('payment.recent.refresh')"
        :loading="loading"
        @click="emit('refresh')"
      >
        <VueIcon name="bs:arrow-clockwise" class="text-[1.65rem]" />
      </Button>
    </div>

    <div v-if="loading && orders.length === 0" class="mt-5 grid gap-3">
      <div
        v-for="index in 3"
        :key="index"
        class="h-20 animate-pulse rounded-lg bg-(--color-surface-container-high)"
      ></div>
    </div>

    <div v-else-if="orders.length > 0" class="mt-5 grid gap-3">
      <RecentOrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
        :status-loading="statusLoadingIds.includes(order.id)"
        @continue-payment="emit('continuePayment', $event)"
        @refresh-order="emit('refreshOrder', $event)"
      />
    </div>

    <p v-else class="mt-5 text-sm leading-6 text-(--color-on-surface-variant)">
      {{ t('payment.recent.empty') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { useI18n } from 'vue-i18n'
import type { OrderDetails } from '../types/payment'
import RecentOrderCard from './RecentOrderCard.vue'

defineProps<{
  loading: boolean
  orders: OrderDetails[]
  statusLoadingIds: string[]
}>()

const emit = defineEmits<{
  continuePayment: [order: OrderDetails]
  refresh: []
  refreshOrder: [order: OrderDetails]
}>()

const { t } = useI18n()
</script>
