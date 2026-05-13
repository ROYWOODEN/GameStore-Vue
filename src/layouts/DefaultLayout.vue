<template>
  <div>
    <AppHeader />
    <AppSidebar />
    <AuthDialogHost />
    <slot>
      <main class="ml-[20%] mt-20 min-h-[calc(100vh-5rem)] bg-(--color-background)">
        <PageLoader />
      </main>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/modules/auth'
import { toApiError } from '@/shared/api/error'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader } from '@/shared/ui'
import { AuthDialogHost } from '@/widgets/Auth'
import { AppHeader } from '@/widgets/Header'
import { AppSidebar } from '@/widgets/Sidebar'
import { useToast } from 'primevue/usetoast'
import { onMounted } from 'vue'

const { refresh, isAuthenticated } = useAuth()
const { getMessage } = useI18nMessage()
const toast = useToast()

const initializeSession = async () => {
  if (!isAuthenticated.value) {
    try {
      await refresh()
    } catch (error: unknown) {
      const ApiError = toApiError(error)
      toast.add({
        severity: 'error',
        summary: getMessage(`errors.types.${ApiError.type}`),
        detail: getMessage(ApiError.message),
        life: 3000,
      })
    }
  }
}

onMounted(() => initializeSession())
</script>

<style scoped></style>
