<template>
  <Form
    :key="formKey"
    v-slot="$form"
    class="grid gap-6"
    :initial-values="formInitialValues"
    :resolver="formResolver"
    validate-on-value-update
    validate-on-blur
    @submit="handleSubmit"
  >
    <section
      class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5"
    >
      <div class="mb-5 flex items-center gap-3">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-xl text-(--color-primary)"
        >
          <VueIcon name="bs:controller" />
        </span>
        <div>
          <h2 class="text-lg font-extrabold text-(--color-on-surface)">
            {{ t('admin.form.baseTitle') }}
          </h2>
          <p class="mt-1 text-xs text-(--color-on-surface-variant)">
            {{ t('admin.form.baseDescription') }}
          </p>
        </div>
      </div>

      <div class="grid gap-4 min-[860px]:grid-cols-[minmax(0,1fr)_14rem]">
        <FormField v-slot="$field" name="title">
          <label class="grid gap-2">
            <span class="field-label">{{ t('admin.form.fields.title') }}</span>
            <InputText
              v-bind="$field.props"
              v-model.trim="form.title"
              autocomplete="off"
              class="h-12! w-full! rounded-md!"
              fluid
              :invalid="shouldShowFieldError($field)"
              placeholder="Cyber Arena"
            />
            <Message
              v-if="shouldShowFieldError($field)"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ getFieldError('title') ?? $field.error?.message }}
            </Message>
          </label>
        </FormField>

        <FormField v-slot="$field" name="price">
          <label class="grid gap-2">
            <span class="field-label">{{ t('admin.form.fields.price') }}</span>
            <InputNumber
              v-bind="$field.props"
              v-model="form.price"
              class="w-full"
              fluid
              :allow-empty="false"
              :invalid="shouldShowFieldError($field)"
              :min="0"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
              :use-grouping="false"
              input-class="h-12! rounded-md!"
              placeholder="1499"
            />
            <Message
              v-if="shouldShowFieldError($field)"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ getFieldError('price') ?? $field.error?.message }}
            </Message>
          </label>
        </FormField>
      </div>

      <FormField v-slot="$field" name="description">
        <label class="mt-4 grid gap-2">
          <span class="field-label">{{ t('admin.form.fields.description') }}</span>
          <Textarea
            v-bind="$field.props"
            v-model.trim="form.description"
            auto-resize
            class="min-h-32! w-full! rounded-md!"
            fluid
            :invalid="shouldShowFieldError($field)"
            :placeholder="t('admin.form.placeholderDescription')"
          />
          <Message
            v-if="shouldShowFieldError($field)"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ getFieldError('description') ?? $field.error?.message }}
          </Message>
        </label>
      </FormField>
    </section>

    <section
      class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5"
    >
      <AdminGameTagSelector
        v-model:selected-tags="selectedTags"
        :errors-by-type="visibleTagErrorsByType"
        :tag-types="tagTypes"
      />
    </section>

    <section
      class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5"
    >
      <div class="mb-5 flex items-center gap-3">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-surface-container-high)_74%,#2576d2_26%)] text-xl text-[#2576d2]"
        >
          <VueIcon name="bs:images" />
        </span>
        <div>
          <h2 class="text-lg font-extrabold text-(--color-on-surface)">
            {{ t('admin.form.imagesTitle') }}
          </h2>
          <p class="mt-1 text-xs text-(--color-on-surface-variant)">
            {{ t('admin.form.imagesDescription') }}
          </p>
        </div>
      </div>

      <div class="grid gap-5">
        <AdminGameImageManager
          v-if="currentImages.length > 0"
          :deleting-image-ids="deletingImageIds"
          :images="currentImages"
          :is-reordering="isReordering"
          @delete="emit('deleteImage', $event)"
          @reorder="emit('reorderImages', $event)"
        />

        <AdminImagePicker
          v-model:files="selectedImages"
          :button-label="mode === 'create' ? 'admin.form.pickCovers' : 'admin.form.pickImages'"
          :hint="mode === 'create' ? 'admin.form.uploadHint' : 'admin.form.newImageHint'"
          :title="mode === 'create' ? 'admin.form.uploadTitle' : 'admin.form.newImageTitle'"
        />
      </div>

      <Message v-if="visibleImageError" class="mt-3" severity="error" size="small" variant="simple">
        {{ imageError }}
      </Message>
    </section>

    <div class="flex flex-wrap items-center justify-end gap-3">
      <button
        v-if="showCancel"
        class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-(--color-outline-variant) bg-transparent px-5 text-sm font-bold text-(--color-on-surface-variant) transition-colors hover:border-(--color-outline) hover:text-(--color-on-surface)"
        type="button"
        @click="emit('cancel')"
      >
        <VueIcon name="bs:x-lg" />
        <span>{{ t('admin.form.cancel') }}</span>
      </button>
      <button
        class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md bg-(--color-primary) px-6 text-sm font-bold text-(--color-on-primary) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        :disabled="isSaving || (!$form.valid && hasSubmitted)"
      >
        <i v-if="isSaving" class="pi pi-spin pi-spinner" />
        <VueIcon v-else :name="mode === 'create' ? 'bs:plus-circle' : 'bs:check2'" />
        <span>{{ isSaving ? t('admin.form.saving') : translateMaybe(submitLabel) }}</span>
      </button>
    </div>
  </Form>
</template>

<script setup lang="ts">
import type { FormFieldState, FormResolverOptions, FormSubmitEvent } from '@primevue/forms/form'
import { Form, FormField } from '@primevue/forms'
import Message from 'primevue/message'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  findTagTypeById,
  getRequiredTagTypes,
  getTagTypeLabelKey,
  getTagTypeValidationMessageKey,
  normalizeTagTypeName,
  resolveTagTypeName,
  toAdminTag,
} from '../lib/tags'
import type {
  AdminGame,
  AdminGameFormPayload,
  AdminGameImage,
  AdminTag,
  AdminTagType,
} from '../types/admin'
import AdminGameImageManager from './AdminGameImageManager.vue'
import AdminGameTagSelector from './AdminGameTagSelector.vue'
import AdminImagePicker from './AdminImagePicker.vue'

type GameFormValues = {
  description: string
  price: number | null
  title: string
}

const props = withDefaults(
  defineProps<{
    currentImages?: AdminGameImage[]
    deletingImageIds?: string[]
    initialGame?: AdminGame | null
    isReordering?: boolean
    isSaving?: boolean
    mode?: 'create' | 'edit'
    requireImages?: boolean
    showCancel?: boolean
    submitLabel?: string
    tagTypes: AdminTagType[]
  }>(),
  {
    currentImages: () => [],
    deletingImageIds: () => [],
    initialGame: null,
    isReordering: false,
    isSaving: false,
    mode: 'create',
    requireImages: true,
    showCancel: false,
    submitLabel: 'admin.form.defaultSubmit',
  },
)

const emit = defineEmits<{
  cancel: []
  deleteImage: [imageId: string]
  reorderImages: [imageIds: string[]]
  submit: [payload: AdminGameFormPayload]
}>()

const toast = useToast()
const { t, te } = useI18n()

const form = reactive<GameFormValues>({
  description: '',
  price: null,
  title: '',
})
const selectedTags = ref<AdminTag[]>([])
const selectedImages = ref<File[]>([])
const hasSubmitted = ref(false)
const formResetVersion = ref(0)

const formKey = computed(() => `${props.initialGame?.id ?? 'new'}-${formResetVersion.value}`)
const formInitialValues = computed<GameFormValues>(() => ({
  description: form.description,
  price: form.price,
  title: form.title,
}))
const fieldErrors = computed(() => getFormErrors(form))
const selectedTagIds = computed(() => selectedTags.value.map((tag) => tag.id))
const tagErrorsByType = computed<Record<string, string | null>>(() => {
  const counts = new Map<string, number>()

  for (const tag of selectedTags.value) {
    const type = resolveTagTypeName(tag, props.tagTypes)

    if (!type) {
      continue
    }

    counts.set(type, (counts.get(type) ?? 0) + 1)
  }

  const errors: Record<string, string | null> = {}

  for (const type of getRequiredTagTypes()) {
    const count = counts.get(type) ?? 0

    if (type === 'age') {
      const messageKey = getTagTypeValidationMessageKey(type, count)
      errors[type] = count === 1 || !messageKey ? null : t(messageKey)
      continue
    }

    const messageKey = getTagTypeValidationMessageKey(type, count)
    errors[type] = count >= 1 || !messageKey ? null : t(messageKey)
  }

  return errors
})
const tagErrorEntries = computed(() =>
  Object.entries(tagErrorsByType.value).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0,
  ),
)
const visibleTagErrorsByType = computed(() =>
  hasSubmitted.value || selectedTags.value.length > 0 ? tagErrorsByType.value : {},
)
const imageError = computed(() =>
  props.requireImages && selectedImages.value.length === 0 ? t('admin.form.imageRequired') : null,
)
const visibleImageError = computed(() => hasSubmitted.value && Boolean(imageError.value))

type FormErrorMap = Partial<Record<keyof GameFormValues, { message: string }[]>>

const translateMaybe = (value: string): string => {
  return te(value) ? t(value) : value
}

const getFieldError = (fieldName: keyof GameFormValues): string | undefined => {
  return fieldErrors.value[fieldName]?.[0]?.message
}

const toPriceNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const getFormErrors = (values: GameFormValues): FormErrorMap => {
  const errors: FormErrorMap = {}
  const title = String(values.title ?? '').trim()
  const description = String(values.description ?? '').trim()
  const price = toPriceNumber(values.price)

  if (title.length < 2) {
    errors.title = [{ message: t('admin.validation.titleMin') }]
  }

  if (description.length < 10) {
    errors.description = [{ message: t('admin.validation.descriptionMin') }]
  }

  if (price === null || price < 0) {
    errors.price = [{ message: t('admin.validation.priceMin') }]
  }

  return errors
}

const formResolver = ({ values }: FormResolverOptions) => {
  const nextValues = values as GameFormValues

  return {
    values,
    errors: getFormErrors(nextValues),
  }
}

const shouldShowFieldError = (field: FormFieldState): boolean => {
  return field.invalid && (field.dirty || field.touched || hasSubmitted.value)
}

const getFallbackTypeForTag = (tag: AdminGame['tags'][number]): AdminTagType | undefined => {
  if (typeof tag.type === 'string') {
    const normalizedType = normalizeTagTypeName(tag.type)
    return props.tagTypes.find((type) => normalizeTagTypeName(type.name) === normalizedType)
  }

  const typeId = typeof tag.type === 'object' ? tag.type.id : tag.type_id
  return (findTagTypeById(typeId, props.tagTypes) ?? undefined) as AdminTagType | undefined
}

const resetFromInitialGame = (): void => {
  form.title = props.initialGame?.title ?? ''
  form.description = props.initialGame?.description ?? ''
  form.price = props.initialGame ? Number(props.initialGame.price) : null
  selectedTags.value =
    props.initialGame?.tags.map((tag) => toAdminTag(tag, getFallbackTypeForTag(tag))) ?? []
  selectedImages.value = []
  hasSubmitted.value = false
  formResetVersion.value += 1
}

const getFirstValidationMessage = (event: FormSubmitEvent): string => {
  const fieldLabels: Record<keyof GameFormValues, string> = {
    description: t('admin.form.fields.description'),
    price: t('admin.form.fields.price'),
    title: t('admin.form.fields.title'),
  }
  const fieldOrder: Array<keyof GameFormValues> = ['title', 'price', 'description']
  const formErrors = getFormErrors(event.values as GameFormValues)

  for (const fieldName of fieldOrder) {
    const error = formErrors[fieldName]?.[0]?.message

    if (error) {
      return `${fieldLabels[fieldName]}: ${error}`
    }
  }

  const tagError = tagErrorEntries.value[0]

  if (tagError) {
    return `${t(getTagTypeLabelKey(tagError[0]))}: ${tagError[1]}`
  }

  if (imageError.value) {
    return `${t('admin.form.imageField')}: ${imageError.value}`
  }

  return t('admin.form.validationFallback')
}

const showValidationToast = (event: FormSubmitEvent): void => {
  toast.add({
    severity: 'error',
    summary: t('admin.form.validationSummary'),
    detail: getFirstValidationMessage(event),
    life: 3600,
  })
}

const handleSubmit = (event: FormSubmitEvent): void => {
  hasSubmitted.value = true

  if (!event.valid || tagErrorEntries.value.length > 0 || imageError.value) {
    showValidationToast(event)
    return
  }

  emit('submit', {
    description: form.description.trim(),
    images: selectedImages.value,
    price: String(toPriceNumber(form.price) ?? 0),
    tagIds: selectedTagIds.value,
    title: form.title.trim(),
  })
}

watch(() => props.initialGame, resetFromInitialGame, { immediate: true })
</script>

<style scoped>
.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-on-surface-variant);
  text-transform: uppercase;
}
</style>
