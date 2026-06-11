<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :header="dialogTitle"
    :style="{ width: '31rem' }"
    :breakpoints="{ '575px': '92vw' }"
    :pt="dialogPassThrough"
  >
    <div class="space-y-6">
      <div
        class="grid grid-cols-2 gap-1 rounded-lg border border-(--color-outline-variant) bg-(--color-surface-container-high) p-1"
      >
        <button
          v-for="option in modeOptions"
          :key="option.value"
          type="button"
          :class="[
            'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors',
            mode === option.value
              ? 'bg-(--color-primary) text-(--color-on-primary) shadow-sm'
              : 'text-(--color-on-surface-variant) hover:bg-(--color-surface-container-highest) hover:text-(--color-on-surface)',
          ]"
          :aria-pressed="mode === option.value"
          @click="setMode(option.value)"
        >
          <i :class="option.icon" />
          <span>{{ t(option.labelKey) }}</span>
        </button>
      </div>

      <Message v-if="errorMessage" severity="error" :closable="false" class="w-full">
        {{ errorMessage }}
      </Message>

      <AnimatePresence mode="wait">
        <motion.div
          :key="mode"
          :initial="{ opacity: 0, x: mode === 'login' ? -18 : 18 }"
          :animate="{ opacity: 1, x: 0 }"
          :exit="{ opacity: 0, x: mode === 'login' ? 18 : -18 }"
          :transition="{ duration: 0.2, ease: 'easeOut' }"
        >
          <Form
            :key="formKey"
            v-slot="$form"
            :resolver="formResolver"
            :initial-values="formInitialValues"
            :validate-on-blur="true"
            class="space-y-5"
            @submit="handleSubmit"
          >
            <div v-if="mode === 'register'" class="space-y-2">
              <label
                class="flex items-center gap-2 text-sm font-semibold text-(--color-on-surface)"
                for="auth-name"
              >
                <i class="pi pi-user text-(--color-primary)" />
                <span>{{ t('auth.fields.name') }}</span>
              </label>
              <InputText
                id="auth-name"
                name="name"
                autocomplete="name"
                :placeholder="t('auth.placeholders.name')"
                fluid
                class="w-full rounded-xl! border-2!"
              />
              <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.name.error?.message }}
              </Message>
            </div>

            <div class="space-y-2">
              <label
                class="flex items-center gap-2 text-sm font-semibold text-(--color-on-surface)"
                for="auth-email"
              >
                <i class="pi pi-envelope text-(--color-primary)" />
                <span>{{ t('auth.fields.email') }}</span>
              </label>
              <IconField>
                <InputIcon class="pi pi-at text-(--color-on-surface-variant)!" />
                <InputText
                  id="auth-email"
                  name="email"
                  type="text"
                  inputmode="email"
                  autocomplete="email"
                  :placeholder="t('auth.placeholders.email')"
                  fluid
                  class="w-full rounded-xl! border-2!"
                />
              </IconField>
              <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
                {{ $form.email.error?.message }}
              </Message>
            </div>

            <div class="space-y-2">
              <label
                class="flex items-center gap-2 text-sm font-semibold text-(--color-on-surface)"
                for="auth-password"
              >
                <i class="pi pi-lock text-(--color-primary)" />
                <span>{{ t('auth.fields.password') }}</span>
              </label>
              <Password
                input-id="auth-password"
                name="password"
                :feedback="false"
                toggle-mask
                fluid
                :placeholder="t('auth.placeholders.password')"
                :prompt-label="t('auth.placeholders.password')"
                :input-props="{
                  autocomplete: mode === 'login' ? 'current-password' : 'new-password',
                }"
                :pt="passwordPassThrough"
              />
              <Message
                v-if="$form.password?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.password.error?.message }}
              </Message>
            </div>

            <div class="space-y-3 pt-1">
              <Button
                type="submit"
                :label="submitLabel"
                :icon="submitIcon"
                :loading="loading"
                :disabled="loading"
                class="w-full justify-center! rounded-lg! border-(--color-primary)! bg-(--color-primary)! py-3! font-semibold! text-(--color-on-primary)! hover:border-(--color-primary-strong)! hover:bg-(--color-primary-strong)!"
              />

              <Button
                type="button"
                severity="secondary"
                outlined
                :disabled="loading"
                class="w-full justify-center! gap-2! rounded-lg! border-(--color-outline-variant)! py-3! font-semibold! text-(--color-on-surface)! hover:border-(--color-primary)! hover:text-(--color-primary)!"
                @click="emit('google')"
              >
                <i class="pi pi-google text-base" />
                <span>{{ t('auth.actions.google') }}</span>
              </Button>
            </div>
          </Form>
        </motion.div>
      </AnimatePresence>

      <p class="text-center text-sm text-(--color-on-surface-variant)">
        {{ switchText }}
        <button
          type="button"
          class="ml-1 cursor-pointer font-semibold text-(--color-primary) transition-colors hover:text-(--color-primary-strong)"
          @click="toggleMode"
        >
          {{ switchActionText }}
        </button>
      </p>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@primevue/forms/form'
import Form from '@primevue/forms/form'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { AnimatePresence, motion } from 'motion-v'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { createLoginSchema, createRegisterSchema } from '../schemas/auth.schema'
import type { AuthMode, LoginPayload, RegisterPayload } from '../types/auth'

const props = withDefaults(
  defineProps<{
    errorMessage?: string | null
    initialMode?: AuthMode
    loading?: boolean
  }>(),
  {
    errorMessage: null,
    initialMode: 'login',
    loading: false,
  },
)

const visible = defineModel<boolean>('visible', { required: true })

const emit = defineEmits<{
  google: []
  login: [payload: LoginPayload]
  register: [payload: RegisterPayload]
}>()

const { locale, t } = useI18n()

const mode = ref<AuthMode>(props.initialMode)
const formKey = ref(0)

const translate = (key: string): string => t(key)

const modeOptions: { icon: string; labelKey: string; value: AuthMode }[] = [
  { icon: 'pi pi-sign-in', labelKey: 'auth.modes.login', value: 'login' },
  { icon: 'pi pi-user-plus', labelKey: 'auth.modes.register', value: 'register' },
]

const loginInitialValues: LoginPayload = {
  email: '',
  password: '',
}

const registerInitialValues: RegisterPayload = {
  email: '',
  name: '',
  password: '',
}

const loginSchema = computed(() => {
  void locale.value
  return createLoginSchema(translate)
})

const registerSchema = computed(() => {
  void locale.value
  return createRegisterSchema(translate)
})

const formResolver = computed(() =>
  zodResolver(mode.value === 'login' ? loginSchema.value : registerSchema.value),
)

const formInitialValues = computed(() =>
  mode.value === 'login' ? loginInitialValues : registerInitialValues,
)

const dialogTitle = computed(() =>
  mode.value === 'login' ? t('auth.title.login') : t('auth.title.register'),
)

const submitLabel = computed(() =>
  mode.value === 'login' ? t('auth.actions.login') : t('auth.actions.register'),
)

const submitIcon = computed(() => (mode.value === 'login' ? 'pi pi-sign-in' : 'pi pi-user-plus'))

const switchText = computed(() =>
  mode.value === 'login' ? t('auth.switch.toRegisterText') : t('auth.switch.toLoginText'),
)

const switchActionText = computed(() =>
  mode.value === 'login' ? t('auth.switch.toRegisterAction') : t('auth.switch.toLoginAction'),
)

const passwordPassThrough = {
  root: {
    class: 'w-full!',
  },
  pcInputText: {
    root: {
      class: 'w-full! rounded-xl! border-2!',
    },
  },
  maskIcon: {
    class: 'text-(--color-on-surface-variant)! hover:text-(--color-primary)!',
  },
  unmaskIcon: {
    class: 'text-(--color-on-surface-variant)! hover:text-(--color-primary)!',
  },
}

const dialogPassThrough = {
  root: {
    class:
      'overflow-hidden rounded-xl! border! border-(--color-outline-variant)! bg-(--color-surface-container)! text-(--color-on-surface)! shadow-2xl!',
  },
  header: {
    class: 'bg-(--color-surface-container)! px-7! pb-4! pt-7! text-(--color-on-surface)!',
  },
  title: {
    class: 'text-2xl! font-bold!',
  },
  content: {
    class: 'bg-(--color-surface-container)! px-7! pb-7! text-(--color-on-surface)!',
  },
  mask: {
    class: 'backdrop-blur-sm!',
  },
  closeButton: {
    class:
      'text-(--color-on-surface-variant)! hover:bg-(--color-surface-container-highest)! hover:text-(--color-on-surface)!',
  },
}

const bumpFormKey = (): void => {
  formKey.value += 1
}

const setMode = (nextMode: AuthMode): void => {
  if (mode.value === nextMode) {
    return
  }

  mode.value = nextMode
  bumpFormKey()
}

const toggleMode = (): void => {
  setMode(mode.value === 'login' ? 'register' : 'login')
}

const handleSubmit = (event: FormSubmitEvent): void => {
  if (!event.valid) {
    return
  }

  if (mode.value === 'login') {
    emit('login', loginSchema.value.parse(event.values))
    return
  }

  emit('register', registerSchema.value.parse(event.values))
}

watch(
  () => props.initialMode,
  (nextMode) => {
    if (visible.value) {
      mode.value = nextMode
      bumpFormKey()
    }
  },
)

watch(visible, (isVisible) => {
  if (isVisible) {
    mode.value = props.initialMode
    bumpFormKey()
  }
})
</script>
