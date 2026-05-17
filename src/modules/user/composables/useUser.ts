import { toApiError } from '@/shared/api/error'
import { storeToRefs } from 'pinia'
import {
  fetchCurrentUser,
  fetchDeleteCurrentUser,
  fetchDeleteCurrentUserAvatar,
  fetchUpdateCurrentUser,
  fetchUpdateCurrentUserAvatar,
} from '../api/user.api'
import { useUserStore } from '../stores/user.store'
import type { UpdateCurrentUserPayload } from '../api/user.api'

export const useUser = () => {
  const userStore = useUserStore()
  const { user, hasCurrentUser } = storeToRefs(userStore)

  const loadCurrentUser = async (): Promise<void> => {
    try {
      const res = await fetchCurrentUser()
      userStore.setCurrentUser(res)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    }
  }

  const updateCurrentUser = async (payload: UpdateCurrentUserPayload): Promise<void> => {
    try {
      const res = await fetchUpdateCurrentUser(payload)
      userStore.setCurrentUser(res)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    }
  }

  const updateCurrentUserAvatar = async (avatar: File): Promise<void> => {
    try {
      const res = await fetchUpdateCurrentUserAvatar(avatar)
      userStore.setCurrentUser(res)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    }
  }

  const deleteCurrentUserAvatar = async (): Promise<void> => {
    try {
      const res = await fetchDeleteCurrentUserAvatar()
      userStore.setCurrentUser(res)
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    }
  }

  const deleteCurrentUser = async (): Promise<void> => {
    try {
      await fetchDeleteCurrentUser()
      userStore.clearCurrentUser()
    } catch (error: unknown) {
      const apiError = toApiError(error)
      throw apiError
    }
  }

  return {
    deleteCurrentUser,
    deleteCurrentUserAvatar,
    loadCurrentUser,
    updateCurrentUser,
    updateCurrentUserAvatar,
    user,
    hasCurrentUser,
    setCurrentUser: userStore.setCurrentUser,
    clearCurrentUser: userStore.clearCurrentUser,
  }
}
