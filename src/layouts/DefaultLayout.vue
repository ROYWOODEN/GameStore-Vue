<template>
  <div class="min-h-screen bg-(--color-background)">
    <AppHeader />
    <AppSidebar />
    <AuthDialogHost />
    <slot>
      <main
        class="mt-20 min-h-[calc(100vh-5rem)] w-full bg-(--color-background) pb-24 lg:ml-[20%] lg:w-[80%] lg:pb-0"
      >
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

const { refresh, isAuthenticated, isSessionInitialized, markSessionInitialized, setAccessToken } =
  useAuth()
const { showApiError } = useApiErrorToast()
const { clearCurrentUser, loadCurrentUser } = useUser()

const initializeSession = async () => {
  if (isSessionInitialized.value) {
    return
  }

  try {
    if (!isAuthenticated.value) {
      await refresh()
    }

    if (isAuthenticated.value) {
      await loadCurrentUser()
    } else {
      clearCurrentUser()
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
