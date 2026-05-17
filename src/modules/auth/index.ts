export { useAuth } from './composables/useAuth'
export { useAuthDialog } from './composables/useAuthDialog'
export { createEmailSchema, createNameSchema, createPasswordSchema } from './schemas/auth.schema'
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
