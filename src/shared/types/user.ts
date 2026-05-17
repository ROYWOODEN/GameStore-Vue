export type UserRole = 'admin' | 'user'

export interface User {
  id: number | string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
  role: UserRole
}
