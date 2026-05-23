<template>
  <main
    class="min-h-[calc(100vh-5rem)] min-w-0 overflow-x-clip bg-(--color-background) px-5 pt-8 pb-12 min-[560px]:px-7 min-[1024px]:px-10 min-[1280px]:px-14"
  >
    <PageLoader v-if="isBasketLoading && basketItems.length === 0" />

    <RetryState
      v-else-if="basketLoadError"
      :title="t('basketPage.loadErrorTitle')"
      :message="getMessage(basketLoadError.message)"
      :action-label="t('basketPage.retry')"
      @retry="handleRetry"
    />

    <section v-else class="mx-auto w-full max-w-7xl min-w-0">
      <motion.header
        class="mb-6 flex flex-col gap-3 min-[760px]:mb-8 min-[760px]:flex-row min-[760px]:items-end min-[760px]:justify-between"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.28, ease: 'easeOut' }"
      >
        <div>
          <h1 class="text-3xl font-extrabold text-(--color-on-surface) min-[760px]:text-4xl">
            {{ t('basketPage.title') }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-(--color-on-surface-variant)">
            {{ t('basketPage.subtitle') }}
          </p>
        </div>
        <div
          class="inline-flex w-fit items-center gap-2 rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-high) px-3 py-2 text-sm font-semibold text-(--color-on-surface-variant)"
        >
          <VueIcon name="bs:controller" class="text-(--color-primary)" />
          <span>{{ t('basketPage.itemsCount', { count: totalBasketCount }) }}</span>
        </div>
      </motion.header>

      <motion.div
        v-if="basketItems.length > 0"
        class="mb-5 flex flex-col gap-3 rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-low) p-4 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between"
        :initial="{ opacity: 0, y: 18 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.24, ease: 'easeOut', delay: 0.04 }"
      >
        <label class="flex cursor-pointer items-center gap-3 text-sm font-semibold">
          <Checkbox
            :model-value="allBasketItemsSelected"
            binary
            :indeterminate="isBasketSelectionPartial"
            @update:model-value="handleSelectAllChange(Boolean($event))"
          />
          <span>{{ t('basketPage.selectAll') }}</span>
        </label>

        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm text-(--color-on-surface-variant)">
            {{ t('basketPage.selectedCount', { count: selectedBasketItems.length }) }}
          </span>
          <Button
            class="h-10! border-[color-mix(in_srgb,var(--color-error)_62%,transparent)]! bg-[color-mix(in_srgb,var(--color-error)_12%,var(--color-surface-container-high))]! px-3! text-sm! font-bold! text-(--color-error)! hover:border-(--color-error)! hover:bg-[color-mix(in_srgb,var(--color-error)_18%,var(--color-surface-container-high))]!"
            type="button"
            :disabled="selectedBasketItems.length === 0 || hasSelectedPending"
            :loading="hasSelectedPending"
            :label="t('basketPage.removeSelected')"
            @click="handleRemoveSelected"
          />
        </div>
      </motion.div>

      <div
        class="grid min-w-0 gap-6 min-[1180px]:grid-cols-[minmax(0,1fr)_minmax(20rem,22rem)] min-[1280px]:gap-8"
      >
        <AnimatePresence
          mode="popLayout"
          as="div"
          class="relative grid min-w-0 content-start gap-4 min-[760px]:gap-5"
        >
          <template v-if="basketItems.length > 0">
            <motion.div
              v-for="game in basketItems"
              :key="game.id"
              layout="position"
              :initial="{ opacity: 0, y: 24, scale: 0.97 }"
              :animate="{ opacity: 1, y: 0, scale: 1 }"
              :exit="{ opacity: 0, x: -28, scale: 0.94 }"
              :transition="{
                layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.2, ease: 'easeOut' },
                x: { duration: 0.22, ease: 'easeOut' },
                y: { duration: 0.26, ease: 'easeOut' },
                scale: { duration: 0.18, ease: 'easeOut' },
              }"
            >
              <BasketGameCard
                :game="game"
                :pending="pendingBasketIdSet.has(game.id)"
                :selected="selectedBasketIdSet.has(game.id)"
                @remove="handleRemove"
                @selection-change="handleSelectionChange"
              />
            </motion.div>
          </template>

          <motion.div
            v-else
            key="empty-basket"
            class="flex min-h-[55vh] flex-col items-center justify-center gap-3 rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-low) p-6 text-center"
            :initial="{ opacity: 0, y: 22 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -18 }"
            :transition="{ duration: 0.28, ease: 'easeOut' }"
          >
            <div
              class="mb-3 flex h-30 w-30 items-center justify-center rounded-full border border-(--color-outline-variant) bg-(--color-menu-active-bg) text-7xl text-(--color-primary)"
              aria-hidden="true"
            >
              <VueIcon name="bs:basket-3-fill" />
            </div>
            <h1 class="text-2xl font-bold text-(--color-on-surface)">
              {{ t('basketPage.emptyTitle') }}
            </h1>
            <p class="text-sm leading-6 text-(--color-on-surface-variant)">
              {{ t('basketPage.emptyDescription') }}
            </p>
            <RouterLink
              to="/"
              class="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-(--color-primary) bg-(--color-primary) px-4 text-sm font-bold text-(--color-on-primary) transition-colors hover:border-(--color-primary-strong) hover:bg-(--color-primary-strong)"
            >
              <VueIcon name="fl:home" class="text-xl" />
              <span>{{ t('basketPage.toHome') }}</span>
            </RouterLink>
          </motion.div>
        </AnimatePresence>

        <motion.aside
          class="basket-page-aside grid min-w-0 content-start gap-4"
          :initial="{ opacity: 0, y: 24 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.3, ease: 'easeOut', delay: 0.06 }"
        >
          <BasketOrderSummary
            v-if="basketItems.length > 0"
            :count="selectedBasketItems.length"
            :total-count="totalBasketCount"
            :total-amount="selectedTotalAmount"
            :is-checkout-loading="isCheckoutLoading"
            :is-clearing="isBasketClearing"
            @checkout="handleCheckout"
            @clear="handleClear"
          />

          <RecentOrdersPanel
            :orders="recentOrders"
            :loading="isRecentOrdersLoading"
            :status-loading-ids="orderStatusLoadingIds"
            @refresh="handleRefreshOrders"
            @refresh-order="handleRefreshOrder"
            @continue-payment="handleContinuePayment"
          />
        </motion.aside>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { BasketGameCard, BasketOrderSummary, useBasket, type BasketGame } from '@/modules/basket'
import {
  RecentOrdersPanel,
  useCheckoutPayment,
  type OrderDetails,
  type OrderStatus,
} from '@/modules/payment'
import { isApiError } from '@/shared/api/error'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { AnimatePresence, motion } from 'motion-v'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()
const toast = useToast()
const {
  basketItems,
  basketLoadError,
  getBasket,
  isBasketClearing,
  isBasketLoading,
  pendingBasketIds,
  removeBasketItem,
  removeBasketItems,
  clearBasket,
  selectAllBasketItems,
  selectedBasketIds,
  setBasketSelected,
  setSelectedBasketIds,
} = useBasket()
const {
  createCheckout,
  getOrderStatus,
  getPendingBasketOrders,
  getRecentBasketOrders,
  isCheckoutLoading,
  isRecentOrdersLoading,
  orderStatusLoadingIds,
  recentOrders,
} = useCheckoutPayment()

const pendingBasketIdSet = computed(() => new Set(pendingBasketIds.value))
const selectedBasketIdSet = computed(() => new Set(selectedBasketIds.value))
const totalBasketCount = computed(() => basketItems.value.length)
const selectedBasketItems = computed(() =>
  basketItems.value.filter((game) => selectedBasketIdSet.value.has(game.id)),
)
const selectedTotalAmount = computed(() =>
  selectedBasketItems.value
    .reduce((sum, game) => {
      const price = Number.parseFloat(game.price)
      return Number.isFinite(price) ? sum + price : sum
    }, 0)
    .toFixed(2),
)
const allBasketItemsSelected = computed(
  () =>
    basketItems.value.length > 0 && selectedBasketItems.value.length === basketItems.value.length,
)
const isBasketSelectionPartial = computed(
  () => selectedBasketItems.value.length > 0 && !allBasketItemsSelected.value,
)
const hasSelectedPending = computed(() =>
  selectedBasketItems.value.some((game) => pendingBasketIdSet.value.has(game.id)),
)

const terminalOrderStatuses = new Set<OrderStatus>(['paid', 'canceled', 'failed'])
const pollingOrderIds = new Set<string>()
const notifiedPaidOrderIds = new Set<string>()
const previousOrderStatuses = ref<Record<string, OrderStatus>>({})
let shouldPollOrders = true

const isMissingOrderError = (error: unknown): boolean => {
  return isApiError(error) && [403, 404].includes(error.statusCode)
}

const hasPaidNoticeBeenShown = (orderId: string): boolean => {
  return notifiedPaidOrderIds.has(orderId)
}

const rememberPaidNotice = (orderId: string): void => {
  notifiedPaidOrderIds.add(orderId)
}

const rememberOrderStatuses = (orders: OrderDetails[]): void => {
  previousOrderStatuses.value = {
    ...previousOrderStatuses.value,
    ...Object.fromEntries(orders.map((order) => [order.id, order.status])),
  }
}

const paidTransitionOrders = computed(() =>
  recentOrders.value.filter(
    (order) =>
      order.status === 'paid' &&
      previousOrderStatuses.value[order.id] === 'waiting_for_payment' &&
      !hasPaidNoticeBeenShown(order.id),
  ),
)

const notifyPaidOrder = (order: OrderDetails): void => {
  if (order.status !== 'paid' || hasPaidNoticeBeenShown(order.id)) {
    return
  }

  rememberPaidNotice(order.id)
  toast.add({
    severity: 'success',
    summary: t('payment.status.paid'),
    detail: t('payment.recent.paidDescription'),
    life: 3000,
  })
}

const loadBasketPage = async (selectAll = false): Promise<void> => {
  try {
    await getBasket()
    if (selectAll || selectedBasketIds.value.length === 0) {
      selectAllBasketItems()
    }
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleRetry = (): void => {
  loadBasketPage()
}

const handleRemove = async (game: Pick<BasketGame, 'id' | 'price'>): Promise<void> => {
  try {
    await removeBasketItem(game)
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleRemoveSelected = async (): Promise<void> => {
  if (selectedBasketItems.value.length === 0) {
    return
  }

  try {
    await removeBasketItems(selectedBasketItems.value)
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleClear = async (): Promise<void> => {
  try {
    await clearBasket()
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleSelectionChange = (gameId: BasketGame['id'], selected: boolean): void => {
  setBasketSelected(gameId, selected)
}

const handleSelectAllChange = (selected: boolean): void => {
  if (selected) {
    setSelectedBasketIds(basketItems.value.map((game) => game.id))
    return
  }

  setSelectedBasketIds([])
}

const handleCheckout = async (): Promise<void> => {
  if (selectedBasketItems.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: t('basketPage.selectBeforePayTitle'),
      detail: t('basketPage.selectBeforePayDescription'),
      life: 3000,
    })
    return
  }

  try {
    const selectedGameIds = selectedBasketItems.value.map((game) => game.id)
    const payment = await createCheckout(selectedGameIds)
    previousOrderStatuses.value = {
      ...previousOrderStatuses.value,
      [String(payment.orderId)]: 'waiting_for_payment',
    }
    void handleRefreshOrders()

    if (payment.confirmationUrl) {
      window.location.href = payment.confirmationUrl
      return
    }

    void pollOrderUntilTerminal(String(payment.orderId))
    toast.add({
      severity: 'warn',
      summary: t('basketPage.checkoutUnavailableTitle'),
      detail: t('basketPage.checkoutUnavailableDescription'),
      life: 3000,
    })
  } catch (error: unknown) {
    showApiError(error)
  }
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms))

const pollOrderUntilTerminal = async (orderId: string): Promise<void> => {
  if (pollingOrderIds.has(orderId)) {
    return
  }

  pollingOrderIds.add(orderId)

  try {
    for (let attempt = 0; attempt < 18 && shouldPollOrders; attempt += 1) {
      const order = await getOrderStatus(orderId)

      if (terminalOrderStatuses.has(order.status)) {
        if (order.status === 'paid') {
          if (previousOrderStatuses.value[order.id] === 'waiting_for_payment') {
            notifyPaidOrder(order)
          }
          await loadBasketPage()
        }

        rememberOrderStatuses([order])
        return
      }

      await wait(4000)
    }
  } catch (error: unknown) {
    if (isMissingOrderError(error)) {
      await handleRefreshOrders()
      return
    }

    showApiError(error)
  } finally {
    pollingOrderIds.delete(orderId)
  }
}

const startPendingOrdersPolling = (orders: OrderDetails[]): void => {
  orders
    .filter((order) => order.status === 'waiting_for_payment')
    .forEach((order) => void pollOrderUntilTerminal(order.id))
}

const handleRefreshOrders = async (selectAllAfterBasketRefresh = false): Promise<boolean> => {
  try {
    const pendingBeforeSync = await getPendingBasketOrders(false)
    rememberOrderStatuses(pendingBeforeSync)

    const orders = await getRecentBasketOrders()
    const paidOrders = paidTransitionOrders.value
    let basketReloaded = false

    paidOrders.forEach(notifyPaidOrder)
    rememberOrderStatuses(orders)

    if (paidOrders.length > 0) {
      await loadBasketPage(selectAllAfterBasketRefresh)
      basketReloaded = true
    }

    const pendingOrders = await getPendingBasketOrders(false)
    startPendingOrdersPolling(pendingOrders)
    return basketReloaded
  } catch (error: unknown) {
    showApiError(error)
    return false
  }
}

const handleRefreshOrder = async (currentOrder: OrderDetails): Promise<void> => {
  try {
    const order = await getOrderStatus(currentOrder.id)
    if (currentOrder.status !== 'paid' && order.status === 'paid') {
      notifyPaidOrder(order)
      await loadBasketPage()
    }

    rememberOrderStatuses([order])
  } catch (error: unknown) {
    if (isMissingOrderError(error)) {
      await handleRefreshOrders()
      return
    }

    showApiError(error)
  }
}

const handleContinuePayment = (order: OrderDetails): void => {
  const confirmationUrl = order.payment?.confirmation_url
  if (!confirmationUrl) {
    return
  }

  previousOrderStatuses.value = {
    ...previousOrderStatuses.value,
    [order.id]: 'waiting_for_payment',
  }
  window.location.href = confirmationUrl
}

onMounted(async () => {
  const basketReloaded = await handleRefreshOrders(true)
  if (!basketReloaded) {
    await loadBasketPage(true)
  }
})

onBeforeUnmount(() => {
  shouldPollOrders = false
})
</script>
