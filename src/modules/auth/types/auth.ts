export type AuthMode = 'login' | 'register'

export type OAuthProvider = 'google'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

export interface AuthUser {
  id: number | string
  email: string
  name: string
  avatar_url?: string | null
  created_at: string
  role: AuthRole
}
export type AuthRole = 'admin' | 'user'

export interface AuthTokenSession {
  accessToken: string
}

export interface AuthSession extends AuthTokenSession {
  user: AuthUser
}
