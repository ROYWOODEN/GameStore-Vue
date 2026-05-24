<template>
  <motion.section
    :initial="{ opacity: 0, y: 18 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.32, delay: 0.28, ease: 'easeOut' }"
    class="rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-low) p-5 shadow-[0_14px_32px_rgb(0_0_0/0.12)]"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-2xl font-bold">{{ t('gameDetails.reviews.title') }}</h2>
      <div class="flex items-center gap-2 text-sm font-semibold text-(--color-on-surface-variant)">
        <i v-if="isLoading" class="pi pi-spin pi-spinner text-(--color-primary)" />
        <span>{{ t('gameDetails.reviews.count', { count: reviews.length }) }}</span>
      </div>
    </div>

    <AnimatePresence mode="wait">
      <motion.div
        v-if="myReview && !isEditingReview"
        key="own-review"
        class="mt-5 grid gap-4 rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-high) p-5"
        :initial="{ opacity: 0, y: 14, scale: 0.98 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, y: -10, scale: 0.98 }"
        :transition="{ duration: 0.2, ease: 'easeOut' }"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="grid gap-2">
            <span class="text-lg font-bold">{{ t('gameDetails.reviews.yourReview') }}</span>
            <Rating class="game-rating" :model-value="myReview.rating" readonly :cancel="false" />
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              class="justify-center! gap-2! rounded-lg! border-(--color-outline-variant)! bg-(--color-surface-container-high)! px-4! py-2.5! text-sm! font-bold! text-(--color-on-surface)! hover:border-(--color-primary)! hover:text-(--color-primary)!"
              type="button"
              outlined
              :disabled="isSaving || isDeleting"
              @click="startEditing"
            >
              <VueIcon name="bs:pencil-square" class="text-base" />
              <span>{{ t('gameDetails.reviews.edit') }}</span>
            </Button>
            <Button
              class="justify-center! gap-2! rounded-lg! border-(--color-outline-variant)! bg-(--color-surface-container-high)! px-4! py-2.5! text-sm! font-bold! text-(--color-on-surface)! hover:border-red-500! hover:text-red-500!"
              type="button"
              outlined
              :disabled="isSaving || isDeleting"
              @click="emit('delete')"
            >
              <i v-if="isDeleting" class="pi pi-spin pi-spinner text-base" />
              <VueIcon v-else name="bs:trash" class="text-base" />
              <span>{{
                isDeleting ? t('gameDetails.reviews.deleting') : t('gameDetails.reviews.delete')
              }}</span>
            </Button>
          </div>
        </div>
        <p
          v-if="getReviewText(myReview)"
          class="whitespace-pre-line text-sm leading-7 text-(--color-on-surface-variant)"
        >
          {{ getReviewText(myReview) }}
        </p>
      </motion.div>

      <motion.form
        v-else
        key="review-form"
        class="mt-5 grid gap-5 rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-high) p-5"
        :initial="{ opacity: 0, y: 14, scale: 0.98 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, y: -10, scale: 0.98 }"
        :transition="{ duration: 0.2, ease: 'easeOut' }"
        @submit.prevent="submitReview"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="grid gap-1.5">
            <h3 class="text-lg font-bold">{{ t('gameDetails.reviews.yourReview') }}</h3>
            <p class="text-sm leading-5 text-(--color-on-surface-variant)">
              {{ reviewFormHint }}
            </p>
          </div>
          <Rating
            v-model="reviewRating"
            class="game-rating"
            :cancel="false"
            :readonly="!canReview || isSaving || isDeleting"
          />
        </div>

        <Textarea
          v-model="reviewText"
          class="min-h-32 w-full! resize-y! rounded-lg! border-(--color-outline-variant)! bg-(--color-surface-container-lowest)! p-4! leading-6! text-(--color-on-surface)!"
          :placeholder="t('gameDetails.reviews.placeholder')"
          :disabled="!canReview || isSaving || isDeleting"
          maxlength="2000"
        />

        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-xs font-semibold text-(--color-on-surface-variant)">
            {{ reviewText.length }}/2000
          </span>
          <div class="flex flex-wrap gap-2">
            <Button
              v-if="myReview"
              class="justify-center! gap-2! rounded-lg! border-(--color-outline-variant)! bg-(--color-surface-container-high)! px-4! py-2.5! text-sm! font-bold! text-(--color-on-surface)! hover:border-(--color-primary)! hover:text-(--color-primary)!"
              type="button"
              outlined
              :disabled="isSaving || isDeleting"
              @click="cancelEditing"
            >
              <span>{{ t('gameDetails.reviews.cancel') }}</span>
            </Button>
            <Button
              class="justify-center! gap-2! rounded-lg! border-(--color-primary)! bg-(--color-primary)! px-4! py-2.5! text-sm! font-bold! text-(--color-on-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-primary-strong)!"
              type="submit"
              :disabled="!canSubmit"
            >
              <i v-if="isSaving" class="pi pi-spin pi-spinner text-base" />
              <VueIcon v-else name="fl:filled-send" class="text-base" />
              <span>{{ submitLabel }}</span>
            </Button>
          </div>
        </div>
      </motion.form>
    </AnimatePresence>

    <AnimatePresence mode="popLayout">
      <motion.div
        v-if="reviews.length > 0"
        key="reviews-list"
        class="mt-6 grid gap-5"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.18 }"
      >
        <motion.article
          v-for="review in reviews"
          :key="getReviewKey(review)"
          layout
          class="grid gap-4 rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-high) p-5"
          :initial="{ opacity: 0, y: 24, scale: 0.98 }"
          :while-in-view="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: 14, scale: 0.96 }"
          :viewport="{ once: true, amount: 0.18 }"
          :transition="{ duration: 0.26, ease: 'easeOut' }"
        >
          <div class="flex items-start gap-4">
            <div
              class="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-(--color-primary) text-sm font-black text-(--color-on-primary)"
            >
              <img
                v-if="review.user?.avatar_url"
                class="h-full w-full object-cover"
                :src="review.user.avatar_url"
                :alt="getReviewAuthorName(review)"
              />
              <span v-else>{{ getReviewInitials(review) }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="font-bold">{{ getReviewAuthorName(review) }}</span>
                <Rating class="game-rating" :model-value="review.rating" readonly :cancel="false" />
              </div>
              <p
                v-if="getReviewText(review)"
                class="mt-3 whitespace-pre-line text-sm leading-7 text-(--color-on-surface-variant)"
              >
                {{ getReviewText(review) }}
              </p>
            </div>
          </div>
        </motion.article>
      </motion.div>

      <motion.div
        v-else-if="!isLoading"
        key="reviews-empty"
        class="mt-6 rounded-xl border border-dashed border-(--color-outline-variant) bg-(--color-surface-container-high) p-5 text-sm font-semibold text-(--color-on-surface-variant)"
        :initial="{ opacity: 0, y: 12 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -8 }"
        :transition="{ duration: 0.2, ease: 'easeOut' }"
      >
        {{ t('gameDetails.reviews.empty') }}
      </motion.div>
    </AnimatePresence>
  </motion.section>
</template>

<script setup lang="ts">
import type { GameReview, GameReviewPayload } from '@/modules/game'
import { AnimatePresence, motion } from 'motion-v'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Textarea from 'primevue/textarea'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  canReview: boolean
  isAuthenticated: boolean
  isDeleting: boolean
  isLoading: boolean
  isOwned: boolean
  isSaving: boolean
  myReview: GameReview | null
  reviews: GameReview[]
}>()

const emit = defineEmits<{
  delete: []
  submit: [payload: GameReviewPayload]
}>()

const { t } = useI18n()
const isEditingReview = ref(false)
const reviewRating = ref<number | undefined>()
const reviewText = ref('')

const trimmedReviewText = computed(() => reviewText.value.trim())
const canSubmit = computed(
  () =>
    props.canReview &&
    !props.isSaving &&
    !props.isDeleting &&
    reviewRating.value !== undefined &&
    reviewRating.value >= 1 &&
    reviewRating.value <= 5 &&
    reviewText.value.length <= 2000,
)
const reviewFormHint = computed(() => {
  if (!props.isAuthenticated) {
    return t('gameDetails.reviews.authRequired')
  }

  if (!props.isOwned) {
    return t('gameDetails.reviews.ownershipRequired')
  }

  return props.myReview ? t('gameDetails.reviews.editHint') : t('gameDetails.reviews.createHint')
})
const submitLabel = computed(() => {
  if (props.isSaving) {
    return t('gameDetails.reviews.saving')
  }

  return props.myReview ? t('gameDetails.reviews.update') : t('gameDetails.reviews.create')
})

const setFormFromReview = (review: GameReview | null): void => {
  reviewRating.value = review?.rating
  reviewText.value = review?.text ?? ''
}

const startEditing = (): void => {
  setFormFromReview(props.myReview)
  isEditingReview.value = true
}

const cancelEditing = (): void => {
  setFormFromReview(props.myReview)
  isEditingReview.value = false
}

const submitReview = (): void => {
  if (!canSubmit.value || reviewRating.value === undefined) {
    return
  }

  emit('submit', {
    rating: reviewRating.value,
    text: trimmedReviewText.value,
  })
}

const getReviewAuthorName = (review: GameReview): string =>
  review.user?.name || review.user?.email || t('gameDetails.reviews.anonymous')

const getReviewInitials = (review: GameReview): string =>
  getReviewAuthorName(review)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'

const getReviewText = (review: GameReview): string => review.text?.trim() ?? ''

const getReviewKey = (review: GameReview): string =>
  String(review.id ?? `${review.user_id ?? 'user'}-${review.created_at ?? review.rating}`)

watch(
  () => props.myReview,
  (nextReview, previousReview) => {
    setFormFromReview(nextReview)
    isEditingReview.value = false

    if (!nextReview && previousReview) {
      reviewRating.value = undefined
      reviewText.value = ''
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.game-rating :deep(.p-rating-on-icon) {
  color: var(--color-primary);
}

.game-rating :deep(.p-rating-off-icon) {
  color: color-mix(in srgb, var(--color-on-surface) 34%, transparent);
}
</style>
