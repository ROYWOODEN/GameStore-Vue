<template>
  <main
    class="flex min-h-[calc(100vh-4.5rem)] min-w-0 items-center justify-center bg-(--color-background) px-4 py-12"
  >
    <section class="grid min-w-0 justify-items-center gap-4 text-center">
      <PageLoader />
      <p class="text-sm text-(--color-on-surface-variant)">
        {{ t('auth.callback.loading') }}
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useAuth } from '@/modules/auth'
import { useUser } from '@/modules/user'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { useI18nMessage } from '@/shared/lib/useI18nMessage'
import { PageLoader } from '@/shared/ui'
import { useToast } from 'primevue/usetoast'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

type OAuthCallbackAction = 'link' | 'sign_in'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const { getMessage } = useI18nMessage()
const { showApiError } = useApiErrorToast()
const { refresh } = useAuth()
const { loadCurrentUser } = useUser()

const getAction = (): OAuthCallbackAction => (route.query.action === 'link' ? 'link' : 'sign_in')

const getRedirectTarget = (action: OAuthCallbackAction): string => {
  return action === 'link' ? '/profile' : '/'
}

const handleOAuthCallback = async (): Promise<void> => {
  const action = getAction()
  const status = String(route.query.status ?? '')
  const target = getRedirectTarget(action)

  if (status !== 'success') {
    const errorMessage = String(route.query.error ?? 'errors.auth.oauth_failed')
    toast.add({
      severity: 'error',
      summary: getMessage(errorMessage),
      life: 3500,
    })
    await router.replace(target)
    return
  }

  try {
    const hasSession = await refresh()

    if (!hasSession) {
      toast.add({
        severity: 'error',
        summary: getMessage('errors.auth.refresh_failed'),
        life: 3500,
      })
      await router.replace('/')
      return
    }

    await loadCurrentUser()

    toast.add({
      severity: 'success',
      summary:
        action === 'link' ? t('profile.security.googleLinked') : t('auth.callback.loginSuccess'),
      life: 3000,
    })

    await router.replace(target)
  } catch (error: unknown) {
    showApiError(error)
    await router.replace('/')
  }
}

onMounted(() => {
  handleOAuthCallback()
})
</script>
