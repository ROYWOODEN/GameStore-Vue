import type { User } from '@/shared/types/user'

export const getUserDisplayName = (
  user: User | null | undefined,
  fallbackName = 'Profile',
): string => {
  return user?.name || user?.email || fallbackName
}

export const getUserInitials = (user: User | null | undefined): string => {
  const source = user?.name || user?.email || 'U'
  const parts = source.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return 'U'
  }

  return (parts[0]?.[0] ?? 'U').toUpperCase()
}
