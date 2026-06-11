export type UserRole = 'admin' | 'user'
export type UserAuthProvider = 'google'

export interface UserAuthState {
  hasPassword: boolean
  providers: UserAuthProvider[]
}

export interface User {
  id: number | string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
  role: UserRole
  auth: UserAuthState
}
