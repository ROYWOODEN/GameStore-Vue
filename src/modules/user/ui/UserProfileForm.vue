<template>
  <motion.section
    class="rounded-md border border-(--color-outline-variant) bg-(--color-surface-container) p-6 text-(--color-on-surface) shadow-sm min-[760px]:p-8"
    :initial="{ opacity: 0, y: 24 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.34, ease: 'easeOut', delay: 0.04 }"
  >
    <div class="mb-7 flex items-center gap-4 border-b border-(--color-outline-variant) pb-5">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--color-menu-active-bg) text-xl text-(--color-primary)"
      >
        <VueIcon name="bs:person" />
      </span>
      <h2 class="text-2xl font-bold">{{ t('profile.info.title') }}</h2>
    </div>

    <form class="grid gap-7" @submit.prevent="emit('save')">
      <div class="flex flex-col gap-5 min-[700px]:flex-row min-[700px]:items-center">
        <motion.div
          :class="[
            'relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-(--color-menu-active-bg) text-3xl font-bold text-(--color-primary) shadow-md transition-colors',
            dirtyFields.avatar
              ? 'border-(--color-primary) ring-2 ring-(--color-primary)'
              : 'border-(--color-outline-variant)',
          ]"
          :initial="{ opacity: 0, scale: 0.88 }"
          :animate="{ opacity: 1, scale: 1 }"
          :transition="{ duration: 0.28, ease: 'easeOut', delay: 0.12 }"
        >
          <img
            v-if="displayAvatarUrl"
            :src="displayAvatarUrl"
            :alt="profileName"
            class="h-full w-full object-cover"
          />
          <span v-else>{{ userInitials }}</span>
          <span
            v-if="dirtyFields.avatar"
            class="absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-(--color-primary) text-xs text-(--color-on-primary)"
          >
            <VueIcon name="bs:pencil" />
          </span>
        </motion.div>

        <div class="flex flex-wrap items-center gap-3">
          <input
            ref="avatarInput"
            class="hidden"
            type="file"
            accept="image/png,image/jpeg,image/gif"
            @change="handleAvatarChange"
          />
          <button
            class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-(--color-outline-variant) bg-(--color-surface-container-high) px-4 text-sm font-semibold text-(--color-on-surface) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
            type="button"
            @click="avatarInput?.click()"
          >
            <VueIcon :name="displayAvatarUrl ? 'bs:image' : 'bs:plus-circle'" />
            <span>
              {{ displayAvatarUrl ? t('profile.avatar.change') : t('profile.avatar.add') }}
            </span>
          </button>
          <button
            v-if="displayAvatarUrl"
            class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-(--color-outline-variant) bg-transparent px-4 text-sm font-semibold text-(--color-on-surface-variant) transition-colors hover:border-(--color-error) hover:text-(--color-error) disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            :disabled="isAvatarDeleting"
            @click="emit('removeAvatar')"
          >
            <VueIcon name="bs:trash" />
            <span>{{ t('profile.avatar.remove') }}</span>
          </button>
          <span
            v-if="hasUnsavedChanges"
            class="inline-flex h-8 items-center gap-2 rounded-md bg-(--color-menu-active-bg) px-3 text-xs font-semibold text-(--color-primary)"
          >
            <VueIcon name="bs:info-circle" />
            <span>{{ t('profile.messages.unsaved') }}</span>
          </span>
          <p class="w-full text-xs text-(--color-on-surface-variant)">
            {{ t('profile.avatar.hint') }}
          </p>
        </div>
      </div>

      <div class="grid gap-5 min-[760px]:grid-cols-2">
        <label class="grid gap-2">
          <span class="text-xs font-semibold uppercase text-(--color-on-surface-variant)">
            {{ t('profile.fields.displayName') }}
            <span v-if="dirtyFields.name" class="ml-2 text-(--color-primary)">
              {{ t('profile.messages.changed') }}
            </span>
          </span>
          <input
            v-model.trim="name"
            :class="[inputClass, getInputBorderClass(errors.name, dirtyFields.name)]"
            autocomplete="name"
            type="text"
          />
          <span v-if="errors.name" class="text-xs text-(--color-error)">
            {{ errors.name }}
          </span>
        </label>

        <label class="grid gap-2">
          <span class="text-xs font-semibold uppercase text-(--color-on-surface-variant)">
            {{ t('profile.fields.email') }}
            <span v-if="dirtyFields.email" class="ml-2 text-(--color-primary)">
              {{ t('profile.messages.changed') }}
            </span>
          </span>
          <input
            v-model.trim="email"
            :class="[inputClass, getInputBorderClass(errors.email, dirtyFields.email)]"
            autocomplete="email"
            type="email"
          />
          <span v-if="errors.email" class="text-xs text-(--color-error)">
            {{ errors.email }}
          </span>
        </label>
      </div>

      <label class="grid gap-2">
        <span class="text-xs font-semibold uppercase text-(--color-on-surface-variant)">
          {{ t('profile.fields.newPassword') }}
          <span v-if="dirtyFields.password" class="ml-2 text-(--color-primary)">
            {{ t('profile.messages.changed') }}
          </span>
        </span>
        <span class="relative">
          <input
            v-model="password"
            :class="[
              inputClass,
              'w-full pr-12',
              getInputBorderClass(errors.password, dirtyFields.password),
            ]"
            :placeholder="t('profile.fields.passwordPlaceholder')"
            :type="showPassword ? 'text' : 'password'"
          />
          <button
            class="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-(--color-on-surface-variant) transition-colors hover:bg-(--color-surface-container-highest) hover:text-(--color-primary)"
            type="button"
            :aria-label="
              showPassword ? t('profile.fields.hidePassword') : t('profile.fields.showPassword')
            "
            @click="showPassword = !showPassword"
          >
            <VueIcon :name="showPassword ? 'bs:eye-slash' : 'bs:eye'" />
          </button>
        </span>
        <span
          :class="[
            'text-xs',
            errors.password ? 'text-(--color-error)' : 'text-(--color-on-surface-variant)',
          ]"
        >
          {{ errors.password || t('profile.fields.passwordHint') }}
        </span>
      </label>

      <div class="flex justify-end">
        <div class="grid justify-items-end gap-2">
          <span v-if="hasUnsavedChanges" class="text-xs font-semibold text-(--color-primary)">
            {{ t('profile.messages.saveRequired') }}
          </span>
          <button
            class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md bg-(--color-primary) px-6 text-sm font-bold text-(--color-on-primary) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            :disabled="isSaving || !hasUnsavedChanges"
          >
            <i v-if="isSaving" class="pi pi-spin pi-spinner text-base" />
            <VueIcon v-else name="bs:check2" />
            <span>{{ isSaving ? t('profile.actions.saving') : t('profile.actions.save') }}</span>
          </button>
        </div>
      </div>
    </form>
  </motion.section>
</template>

<script setup lang="ts">
import { motion } from 'motion-v'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

type ProfileFormErrors = {
  email?: string | null
  name?: string | null
  password?: string | null
}

type ProfileDirtyFields = {
  avatar: boolean
  email: boolean
  name: boolean
  password: boolean
}

defineProps<{
  dirtyFields: ProfileDirtyFields
  displayAvatarUrl: string | null
  errors: ProfileFormErrors
  hasUnsavedChanges: boolean
  isAvatarDeleting: boolean
  isSaving: boolean
  profileName: string
  userInitials: string
}>()

const emit = defineEmits<{
  avatarChange: [file: File]
  removeAvatar: []
  save: []
}>()

const email = defineModel<string>('email', { required: true })
const name = defineModel<string>('name', { required: true })
const password = defineModel<string>('password', { required: true })
const showPassword = defineModel<boolean>('showPassword', { required: true })

const { t } = useI18n()
const avatarInput = ref<HTMLInputElement | null>(null)

const inputClass =
  'h-12 rounded-md border bg-(--color-surface-container-high) px-4 text-sm text-(--color-on-surface) outline-none transition-colors focus:border-(--color-primary)'
const idleBorderClass = 'border-(--color-outline-variant)'
const errorBorderClass = 'border-(--color-error)'
const dirtyBorderClass = 'border-(--color-primary) ring-1 ring-(--color-primary)'

const getInputBorderClass = (error: string | null | undefined, isDirty: boolean): string => {
  if (error) {
    return errorBorderClass
  }

  return isDirty ? dirtyBorderClass : idleBorderClass
}

const handleAvatarChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    emit('avatarChange', file)
  }

  input.value = ''
}
</script>
