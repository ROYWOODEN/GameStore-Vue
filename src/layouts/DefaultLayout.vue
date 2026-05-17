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
import { useUser } from '@/modules/user'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { PageLoader } from '@/shared/ui'
import { AuthDialogHost } from '@/widgets/Auth'
import { AppHeader } from '@/widgets/Header'
import { AppSidebar } from '@/widgets/Sidebar'
import { onMounted } from 'vue'

const { refresh, isAuthenticated, markSessionInitialized, setAccessToken } = useAuth()
const { showApiError } = useApiErrorToast()
const { clearCurrentUser, loadCurrentUser } = useUser()

const initializeSession = async () => {
  try {
    if (!isAuthenticated.value) {
      await refresh()
      if (isAuthenticated.value) {
        await loadCurrentUser()
      }
    }
  } catch (error: unknown) {
    setAccessToken(null)
    clearCurrentUser()
    showApiError(error)
  } finally {
    markSessionInitialized()
  }
}

onMounted(() => initializeSession())
</script>

<style scoped></style>
