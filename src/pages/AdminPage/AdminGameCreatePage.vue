<template>
  <motion.section
    class="grid gap-5"
    :initial="{ opacity: 0, y: 16 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.24, ease: 'easeOut' }"
  >
    <div
      class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-5"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-extrabold text-(--color-on-surface)">
            {{ t('admin.games.createTitle') }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-(--color-on-surface-variant)">
            {{ t('admin.games.createDescription') }}
          </p>
        </div>
        <RouterLink
          class="inline-flex h-11 items-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-5 text-sm font-bold text-(--color-on-surface-variant) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
          to="/admin/games"
        >
          <VueIcon name="bs:arrow-left" />
          <span>{{ t('admin.games.backToList') }}</span>
        </RouterLink>
      </div>
    </div>

    <PageLoader v-if="isTagsLoading" />
    <RetryState
      v-else-if="loadError"
      :title="t('admin.tags.loadErrorTitle')"
      :message="getMessage(loadError.message)"
      :action-label="t('admin.common.retry')"
      @retry="loadPage"
    />
    <AdminGameForm
      v-else
      :key="formKey"
      :is-saving="isSaving"
      :tag-types="tagTypes"
      mode="create"
      require-images
      :submit-label="t('admin.games.createSubmit')"
      @submit="handleCreateGame"
    />
  </motion.section>
</template>

<script setup lang="ts">
import { AdminGameForm, useAdminCatalog, type AdminGameFormPayload } from '@/modules/admin'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader, RetryState } from '@/shared/ui'
import { motion } from 'motion-v'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => void
}

const { createGame, isSaving, isTagsLoading, loadError, loadTagTypes, tagTypes } = useAdminCatalog()
const { showApiError } = useApiErrorToast()
const { getMessage } = useI18nMessage()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const formKey = ref(0)

const loadPage = async (): Promise<void> => {
  try {
    await loadTagTypes()
  } catch (error: unknown) {
    showApiError(error)
  }
}

const handleCreateGame = async (payload: AdminGameFormPayload): Promise<void> => {
  try {
    await createGame(payload)
    formKey.value += 1
    toast.add({ severity: 'success', summary: t('admin.games.toastCreated'), life: 2600 })

    const navigate = () => router.push('/admin/games')
    const transitionDocument = document as ViewTransitionDocument

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(navigate)
      return
    }

    await navigate()
  } catch (error: unknown) {
    showApiError(error)
  }
}

onMounted(() => {
  loadPage()
})
</script>
