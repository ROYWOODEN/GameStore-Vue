<template>
  <div class="grid gap-5">
    <section
      class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5"
    >
      <div class="mb-5 flex items-center gap-3">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-surface-container-high)_74%,#008a7a_26%)] text-xl text-[#008a7a]"
        >
          <VueIcon name="bs:tag" />
        </span>
        <div>
          <h2 class="text-lg font-extrabold text-(--color-on-surface)">
            {{ t('admin.tags.createTitle') }}
          </h2>
          <p class="mt-1 text-xs text-(--color-on-surface-variant)">
            {{ t('admin.tags.createDescription') }}
          </p>
        </div>
      </div>

      <form
        class="grid gap-3 min-[760px]:grid-cols-[minmax(0,1fr)_16rem_auto]"
        @submit.prevent="handleCreate"
      >
        <InputText
          v-model.trim="createForm.name"
          class="h-11! w-full!"
          :placeholder="t('admin.tags.namePlaceholder')"
        />
        <Select
          v-model="createForm.typeId"
          class="h-11! w-full!"
          option-label="label"
          option-value="id"
          :options="tagTypeOptions"
          :placeholder="t('admin.tags.typePlaceholder')"
        />
        <button
          class="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-(--color-primary) px-5 text-sm font-bold text-(--color-on-primary) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          :disabled="isSaving || !createForm.name || !createForm.typeId"
        >
          <i v-if="isSaving" class="pi pi-spin pi-spinner" />
          <VueIcon v-else name="bs:plus-lg" />
          <span>{{ t('admin.common.create') }}</span>
        </button>
      </form>
    </section>

    <section
      class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5"
    >
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-extrabold text-(--color-on-surface)">
            {{ t('admin.tags.listTitle') }}
          </h2>
          <p class="mt-1 text-xs text-(--color-on-surface-variant)">
            {{ t('admin.tags.listDescription') }}
          </p>
        </div>
        <span
          class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-3 py-1.5 text-xs font-bold text-(--color-on-surface-variant)"
        >
          {{ t('admin.tags.pageCount', { count: tags.length }) }}
        </span>
      </div>

      <AnimatePresence v-if="tags.length > 0" as="div" mode="popLayout" class="grid gap-2">
        <motion.div
          v-for="tag in tags"
          :key="tag.id"
          class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-low) p-3"
          layout="position"
          :initial="{ opacity: 0, y: 10, scale: 0.98 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, x: 20, scale: 0.96 }"
          :transition="{ duration: 0.18, ease: 'easeOut' }"
        >
          <form
            v-if="editingTagId === tag.id"
            class="grid gap-2 min-[760px]:grid-cols-[minmax(0,1fr)_15rem_auto_auto]"
            @submit.prevent="handleUpdate(tag.id)"
          >
            <InputText v-model.trim="editForm.name" class="h-10! w-full!" />
            <Select
              v-model="editForm.typeId"
              class="h-10! w-full!"
              option-label="label"
              option-value="id"
              :options="tagTypeOptions"
            />
            <button
              class="tag-row-button border-(--color-primary) bg-(--color-menu-active-bg) text-(--color-primary)"
              type="submit"
              :disabled="isSaving || !editForm.name || !editForm.typeId"
            >
              <i v-if="isSaving" class="pi pi-spin pi-spinner" />
              <VueIcon v-else name="bs:check2" />
              <span>{{ t('admin.common.save') }}</span>
            </button>
            <button
              class="tag-row-button border-(--color-outline-variant) bg-transparent text-(--color-on-surface-variant)"
              type="button"
              @click="stopEdit"
            >
              <VueIcon name="bs:x-lg" />
              <span>{{ t('admin.common.cancel') }}</span>
            </button>
          </form>

          <div v-else class="flex flex-wrap items-center gap-2">
            <span
              class="mr-auto rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-3 py-2 text-sm font-bold text-(--color-on-surface)"
            >
              {{ tag.name }}
            </span>
            <span
              class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-2.5 py-1 text-xs font-bold text-(--color-on-surface-variant)"
            >
              {{ t(getTagTypeLabelKey(tag.type?.name ?? '')) }}
            </span>
            <button
              class="tag-icon-button text-[#2576d2] hover:border-[#2576d2]"
              type="button"
              :aria-label="t('admin.tags.editLabel')"
              @click="startEdit(tag)"
            >
              <VueIcon name="bs:pencil" />
            </button>
            <button
              class="tag-icon-button text-(--color-error) hover:border-(--color-error)"
              type="button"
              :aria-label="t('admin.tags.removeLabel')"
              :disabled="deletingTagIds.includes(tag.id)"
              @click="emit('delete', tag.id)"
            >
              <i v-if="deletingTagIds.includes(tag.id)" class="pi pi-spin pi-spinner" />
              <VueIcon v-else name="bs:trash" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <p
        v-else
        class="rounded-md border border-dashed border-(--color-outline-variant) bg-(--color-surface-container-low) p-4 text-sm text-(--color-on-surface-variant)"
      >
        {{ t('admin.tags.empty') }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getTagTypeLabelKey } from '../lib/tags'
import type { AdminTag, AdminTagPayload, AdminTagType } from '../types/admin'

const props = withDefaults(
  defineProps<{
    deletingTagIds?: string[]
    isSaving?: boolean
    tags: AdminTag[]
    tagTypes: AdminTagType[]
  }>(),
  {
    deletingTagIds: () => [],
    isSaving: false,
  },
)

const emit = defineEmits<{
  create: [payload: AdminTagPayload]
  delete: [id: string]
  update: [id: string, payload: AdminTagPayload]
}>()

const createForm = reactive({
  name: '',
  typeId: '',
})
const editForm = reactive({
  name: '',
  typeId: '',
})
const editingTagId = ref<string | null>(null)
const { t } = useI18n()

const tagTypeOptions = computed(() =>
  props.tagTypes.map((type) => ({
    id: type.id,
    label: `${t(getTagTypeLabelKey(type.name))} (${type.name})`,
  })),
)

const handleCreate = (): void => {
  if (!createForm.name || !createForm.typeId) {
    return
  }

  emit('create', {
    name: createForm.name,
    typeId: createForm.typeId,
  })
  createForm.name = ''
}

const startEdit = (tag: AdminTag): void => {
  editingTagId.value = tag.id
  editForm.name = tag.name
  editForm.typeId = tag.type?.id ?? tag.type_id ?? ''
}

const stopEdit = (): void => {
  editingTagId.value = null
  editForm.name = ''
  editForm.typeId = ''
}

const handleUpdate = (id: string): void => {
  if (!editForm.name || !editForm.typeId) {
    return
  }

  emit('update', id, {
    name: editForm.name,
    typeId: editForm.typeId,
  })
  stopEdit()
}

watch(
  tagTypeOptions,
  (options) => {
    if (!createForm.typeId && options[0]) {
      createForm.typeId = options[0].id
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.tag-row-button,
.tag-icon-button {
  display: inline-flex;
  height: 2.5rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-outline-variant);
  padding: 0 0.875rem;
  font-size: 0.8125rem;
  font-weight: 800;
  transition:
    border-color 160ms ease,
    opacity 160ms ease;
}

.tag-icon-button {
  width: 2.5rem;
  padding: 0;
  background: var(--color-surface-container-high);
}

.tag-row-button:disabled,
.tag-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
