export { useAuth } from './composables/useAuth'
export { useAuthDialog } from './composables/useAuthDialog'
export { useAuthPrompt } from './composables/useAuthPrompt'
export { createEmailSchema, createNameSchema, createPasswordSchema } from './schemas/auth.schema'
export { useAuthPromptStore } from './stores/auth-prompt.store'
export { useAuthStore } from './stores/auth.store'
export type {
  AuthMode,
  AuthSession,
  AuthUser,
  LoginPayload,
  OAuthProvider,
  RegisterPayload,
} from './types/auth'
export { default as AuthDialog } from './ui/AuthDialog.vue'
