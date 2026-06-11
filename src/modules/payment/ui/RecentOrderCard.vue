<template>
  <article
    class="min-w-0 overflow-hidden rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-high) p-3"
  >
    <div class="flex min-w-0 items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <span class="truncate text-sm font-bold">
            {{ t('payment.recent.order', { id: order.id }) }}
          </span>
          <Tag
            :value="t(`payment.status.${order.status}`)"
            :severity="getStatusSeverity(order.status)"
            class="px-2! py-1! text-[0.68rem]!"
          />
        </div>
        <p class="mt-1 truncate text-xs text-(--color-on-surface-variant)">
          {{ orderTitle }}
        </p>
      </div>
      <span class="shrink-0 whitespace-nowrap text-sm font-extrabold text-(--color-primary)">
        {{ formatRubPrice(order.total_amount) }}
      </span>
    </div>

    <div class="mt-3 grid gap-2">
      <span class="text-xs text-(--color-on-surface-variant)">
        {{ formattedDate }}
      </span>

      <div class="grid gap-2">
        <Button
          text
          size="small"
          class="h-9! w-full! justify-center! px-2.5! text-xs! text-(--color-on-surface-variant)!"
          type="button"
          :loading="statusLoading"
          :label="t('payment.recent.checkStatus')"
          @click="emit('refreshOrder', order)"
        />
        <Button
          v-if="canContinuePayment"
          size="small"
          class="h-9! w-full! justify-center! border-(--color-primary)! bg-(--color-primary)! px-3! text-xs! font-bold! text-(--color-on-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-primary-strong)!"
          type="button"
          :label="t('payment.recent.continuePayment')"
          @click="emit('continuePayment', order)"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { formatRubPrice } from '@/shared/lib/price'
import { useDateFormat } from '@vueuse/core'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { OrderDetails, OrderStatus } from '../types/payment'

const props = defineProps<{
  order: OrderDetails
  statusLoading: boolean
}>()

const emit = defineEmits<{
  continuePayment: [order: OrderDetails]
  refreshOrder: [order: OrderDetails]
}>()

const { locale, t } = useI18n()
const terminalStatuses = new Set<OrderStatus>(['paid', 'canceled', 'failed'])
const orderDate = computed(() => props.order.created_at)

const canContinuePayment = computed(
  () =>
    props.order.status === 'waiting_for_payment' && Boolean(props.order.payment?.confirmation_url),
)

const formattedDate = useDateFormat(orderDate, 'DD.MM, HH:mm', { locales: locale })

const orderTitle = computed(() => {
  if (props.order.items.length === 0) {
    return t('payment.recent.noItems')
  }

  return props.order.items.map((item) => item.title_snapshot).join(', ')
})

const getStatusSeverity = (status: OrderStatus): 'success' | 'warn' | 'danger' | 'info' => {
  if (status === 'paid') {
    return 'success'
  }

  if (status === 'waiting_for_payment') {
    return 'warn'
  }

  if (terminalStatuses.has(status)) {
    return 'danger'
  }

  return 'info'
}
</script>
