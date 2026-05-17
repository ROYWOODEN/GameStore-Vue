import type { User, UserRole } from '@/shared/types/user'

export type AuthMode = 'login' | 'register'

export type OAuthProvider = 'google'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

export type AuthUser = User
export type AuthRole = UserRole

export interface AuthTokenSession {
  accessToken: string
}

export interface AuthSession extends AuthTokenSession {
  user: AuthUser
}
