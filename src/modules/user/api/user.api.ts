import { api } from '@/shared/api/http'
import { apiRequest } from '@/shared/api/request'
import type { UserAuthProvider } from '@/shared/types/user'
import type { User } from '../types/user'

export type UpdateCurrentUserPayload = Pick<User, 'email' | 'name'> & {
  password?: string
}

export const fetchCurrentUser = async () => {
  return await apiRequest<User>(api.get('/users/me'))
}
export const fetchUpdateCurrentUser = async (body: UpdateCurrentUserPayload) => {
  return await apiRequest<User>(api.patch('/users/me', body))
}

export const fetchUpdateCurrentUserAvatar = async (avatar: File) => {
  const formData = new FormData()
  formData.append('avatar', avatar)

  return await apiRequest<User>(
    api.patch('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  )
}

export const fetchDeleteCurrentUserAvatar = async () => {
  return await apiRequest<User>(api.delete('/users/me/avatar'))
}

export const fetchUnlinkCurrentUserProvider = async (provider: UserAuthProvider) => {
  return await apiRequest<User>(api.delete(`/users/me/providers/${provider}`))
}

export const fetchDeleteCurrentUser = async () => {
  return await apiRequest<void>(api.delete('/users/me'))
}
