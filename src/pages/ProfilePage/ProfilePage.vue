<template>
  <main
    class="min-h-[calc(100vh-4.5rem)] min-w-0 overflow-x-clip bg-(--color-background) px-4 pt-8 pb-12 min-[560px]:px-8 min-[1024px]:px-12 min-[1280px]:px-20"
  >
    <PageLoader v-if="isProfileLoading || isWaitingForSession" />

    <section
      v-else
      class="mx-auto grid max-w-7xl min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)]"
    >
      <motion.div
        class="min-w-0 xl:col-span-2"
        :initial="{ opacity: 0, y: 18 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.28, ease: 'easeOut' }"
      >
        <h1 class="text-3xl font-bold text-(--color-on-surface)">
          {{ t('profile.title') }}
        </h1>
        <p class="mt-2 text-sm text-(--color-on-surface-variant)">
          {{ t('profile.subtitle') }}
        </p>
      </motion.div>

      <UserProfileForm
        v-model:email="form.email"
        v-model:name="form.name"
        v-model:password="password"
        v-model:show-password="showPassword"
        :display-avatar-url="displayAvatarUrl"
        :dirty-fields="dirtyFields"
        :errors="visibleValidationErrors"
        :has-unsaved-changes="hasUnsavedChanges"
        :is-avatar-deleting="isAvatarDeleting"
        :is-saving="isSaving"
        :profile-name="profileName"
        :user-initials="userInitials"
        @avatar-change="handleAvatarChange"
        @remove-avatar="handleRemoveAvatar"
        @save="handleSaveProfile"
      />

      <aside class="grid min-w-0 content-start gap-5">
        <UserSecurityPanel
          :has-password="hasPassword"
          :is-google-linked="isGoogleLinked"
          :is-google-updating="isGoogleProviderUpdating"
          @connect-google="handleConnectGoogle"
          @disconnect-google="requestDisconnectGoogle"
        />
        <UserPreferencesPanel
          :locale="currentLocale"
          :theme="theme"
          @locale-change="setLocale"
          @toggle-theme="toggleTheme"
        />
        <UserAdminPanel v-if="user?.role === 'admin'" />
        <UserAccountActions :is-deleting="isDeletingUser" @delete-user="requestDeleteUser" />
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { setLocale, type AppLocale } from '@/app/i18n'
import { useAppTheme } from '@/app/theme/useAppTheme'
import { createEmailSchema, createNameSchema, createPasswordSchema, useAuth } from '@/modules/auth'
import {
  UserAccountActions,
  UserAdminPanel,
  UserPreferencesPanel,
  UserProfileForm,
  UserSecurityPanel,
  useUser,
} from '@/modules/user'
import { buildAssetUrl } from '@/shared/lib/url'
import { useApiErrorToast } from '@/shared/lib/useApiErrorToast'
import { getUserDisplayName, getUserInitials } from '@/shared/lib/user'
import { PageLoader } from '@/shared/ui'
import { motion } from 'motion-v'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const maxAvatarSizeBytes = 5 * 1024 * 1024

const router = useRouter()
const { locale, t } = useI18n()
const { continueWithGoogleLink, isAuthenticated, isSessionInitialized, setAccessToken } = useAuth()
const { theme, toggleTheme } = useAppTheme()
const { showApiError } = useApiErrorToast()
const confirm = useConfirm()
const toast = useToast()
const {
  deleteCurrentUser,
  deleteCurrentUserAvatar,
  loadCurrentUser,
  unlinkCurrentUserProvider,
  updateCurrentUser,
  updateCurrentUserAvatar,
  user,
} = useUser()

const selectedAvatar = ref<File | null>(null)
const selectedAvatarUrl = ref<string | null>(null)
const avatarMarkedForRemoval = ref(false)
const isAvatarDeleting = ref(false)
const isDeletingUser = ref(false)
const isGoogleProviderUpdating = ref(false)
const isProfileLoading = ref(false)
const isSaving = ref(false)
const hasSubmitted = ref(false)
const password = ref('')
const showPassword = ref(false)

const form = reactive({
  email: '',
  name: '',
})

const currentAvatarUrl = computed(() =>
  buildAssetUrl(user.value?.avatar_url, import.meta.env.VITE_API_URL),
)
const displayAvatarUrl = computed(() => {
  if (avatarMarkedForRemoval.value) {
    return null
  }

  return selectedAvatarUrl.value || currentAvatarUrl.value
})
const currentLocale = computed(() => locale.value as AppLocale)
const hasPassword = computed(() => Boolean(user.value?.auth?.hasPassword))
const isGoogleLinked = computed(() => user.value?.auth?.providers.includes('google') ?? false)
const profileName = computed(() => getUserDisplayName(user.value, t('profile.fallbackName')))
const userInitials = computed(() => getUserInitials(user.value))

const validationErrors = computed(() => {
  const nameResult = createNameSchema(t).safeParse(form.name)
  const emailResult = createEmailSchema(t).safeParse(form.email)
  const passwordResult = password.value ? createPasswordSchema(t).safeParse(password.value) : null

  return {
    email: emailResult.success ? null : (emailResult.error.issues[0]?.message ?? null),
    name: nameResult.success ? null : (nameResult.error.issues[0]?.message ?? null),
    password:
      !passwordResult || passwordResult.success
        ? null
        : (passwordResult.error.issues[0]?.message ?? null),
  }
})
const hasValidationErrors = computed(() => Object.values(validationErrors.value).some(Boolean))
const hasUnsavedChanges = computed(() => {
  return (
    form.email !== (user.value?.email ?? '') ||
    form.name !== (user.value?.name ?? '') ||
    Boolean(password.value) ||
    Boolean(selectedAvatar.value) ||
    avatarMarkedForRemoval.value
  )
})
const dirtyFields = computed(() => ({
  avatar: Boolean(selectedAvatar.value) || avatarMarkedForRemoval.value,
  email: form.email !== (user.value?.email ?? ''),
  name: form.name !== (user.value?.name ?? ''),
  password: Boolean(password.value),
}))
const isWaitingForSession = computed(
  () => !user.value && !isAuthenticated.value && !isSessionInitialized.value,
)
const visibleValidationErrors = computed(() => ({
  email: hasSubmitted.value || form.email ? validationErrors.value.email : null,
  name: hasSubmitted.value || form.name ? validationErrors.value.name : null,
  password: password.value ? validationErrors.value.password : null,
}))

watch(
  user,
  (currentUser) => {
    form.email = currentUser?.email ?? ''
    form.name = currentUser?.name ?? ''
  },
  { immediate: true },
)

const revokeSelectedAvatarUrl = (): void => {
  if (selectedAvatarUrl.value) {
    URL.revokeObjectURL(selectedAvatarUrl.value)
    selectedAvatarUrl.value = null
  }
}

const handleAvatarChange = (file: File): void => {
  if (file.size > maxAvatarSizeBytes) {
    toast.add({
      severity: 'error',
      summary: t('errors.types.UploadError'),
      detail: t('profile.avatar.tooLarge'),
      life: 3000,
    })
    return
  }

  revokeSelectedAvatarUrl()
  selectedAvatar.value = file
  selectedAvatarUrl.value = URL.createObjectURL(file)
  avatarMarkedForRemoval.value = false
}

const handleRemoveAvatar = (): void => {
  selectedAvatar.value = null
  avatarMarkedForRemoval.value = true
  revokeSelectedAvatarUrl()
}

const handleSaveProfile = async (): Promise<void> => {
  if (isSaving.value || !hasUnsavedChanges.value) {
    return
  }

  hasSubmitted.value = true

  if (hasValidationErrors.value) {
    toast.add({
      severity: 'error',
      summary: t('errors.types.ValidationError'),
      detail: t('profile.messages.validationFailed'),
      life: 3000,
    })
    return
  }

  try {
    isSaving.value = true

    await updateCurrentUser({
      email: form.email,
      name: form.name,
      ...(password.value ? { password: password.value } : {}),
    })

    if (avatarMarkedForRemoval.value && currentAvatarUrl.value) {
      isAvatarDeleting.value = true
      await deleteCurrentUserAvatar()
      avatarMarkedForRemoval.value = false
    }

    if (selectedAvatar.value) {
      await updateCurrentUserAvatar(selectedAvatar.value)
      selectedAvatar.value = null
      revokeSelectedAvatarUrl()
    }

    password.value = ''
    hasSubmitted.value = false
    toast.add({
      severity: 'success',
      summary: t('profile.messages.updated'),
      life: 3000,
    })
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    isSaving.value = false
    isAvatarDeleting.value = false
  }
}

const handleConnectGoogle = async (): Promise<void> => {
  if (isGoogleProviderUpdating.value) {
    return
  }

  try {
    isGoogleProviderUpdating.value = true
    await continueWithGoogleLink()
  } catch (error: unknown) {
    showApiError(error)
    isGoogleProviderUpdating.value = false
  }
}

const handleDisconnectGoogle = async (): Promise<void> => {
  if (isGoogleProviderUpdating.value || !isGoogleLinked.value || !hasPassword.value) {
    return
  }

  try {
    isGoogleProviderUpdating.value = true
    await unlinkCurrentUserProvider('google')
    toast.add({
      severity: 'success',
      summary: t('profile.security.googleUnlinked'),
      life: 3000,
    })
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    isGoogleProviderUpdating.value = false
  }
}

const requestDisconnectGoogle = (): void => {
  confirm.require({
    accept: () => {
      handleDisconnectGoogle()
    },
    acceptClass: 'profile-confirm-delete-button',
    acceptIcon: 'pi pi-google',
    acceptLabel: t('profile.security.confirmGoogleDisconnectAction'),
    defaultFocus: 'reject',
    header: t('profile.security.confirmGoogleDisconnectTitle'),
    icon: 'pi pi-exclamation-triangle',
    message: t('profile.security.confirmGoogleDisconnectDescription'),
    rejectClass: 'profile-confirm-cancel-button',
    rejectLabel: t('profile.account.cancelAction'),
  })
}

const handleDeleteUser = async (): Promise<void> => {
  if (isDeletingUser.value) {
    return
  }

  try {
    isDeletingUser.value = true
    await deleteCurrentUser()
    setAccessToken(null)
    await router.push('/')
    toast.add({
      severity: 'success',
      summary: t('profile.account.deleted'),
      life: 3000,
    })
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    isDeletingUser.value = false
  }
}

const requestDeleteUser = (): void => {
  confirm.require({
    accept: () => {
      handleDeleteUser()
    },
    acceptClass: 'profile-confirm-delete-button',
    acceptIcon: 'pi pi-trash',
    acceptLabel: t('profile.account.confirmAction'),
    defaultFocus: 'reject',
    header: t('profile.account.confirmTitle'),
    icon: 'pi pi-exclamation-triangle',
    message: t('profile.account.confirmDescription'),
    rejectClass: 'profile-confirm-cancel-button',
    rejectLabel: t('profile.account.cancelAction'),
  })
}

const loadProfile = async (): Promise<void> => {
  if (user.value || !isAuthenticated.value) {
    return
  }

  try {
    isProfileLoading.value = true
    await loadCurrentUser()
  } catch (error: unknown) {
    showApiError(error)
  } finally {
    isProfileLoading.value = false
  }
}

onMounted(() => {
  loadProfile()
})

watch(isSessionInitialized, (initialized) => {
  if (initialized && isAuthenticated.value && !user.value) {
    loadProfile()
  }
})

onBeforeUnmount(() => {
  revokeSelectedAvatarUrl()
})
</script>
