import { api } from '@/shared/api/http'
import { apiRequest } from '@/shared/api/request'
import type { AuthSession, AuthTokenSession, LoginPayload, RegisterPayload } from '../types/auth'

interface OAuthRedirect {
  url: string
}

export const fetchLogin = async (body: LoginPayload) => {
  return await apiRequest<AuthSession>(api.post('/auth/login', body))
}
export const fetchRegister = async (body: RegisterPayload) => {
  return await apiRequest<AuthSession>(api.post('/auth/register', body))
}
export const fetchLogout = async () => {
  return await apiRequest<void>(api.post('/auth/logout'))
}

export const fetchRefresh = async () => {
  return await apiRequest<AuthTokenSession>(api.post('/auth/refresh'))
}

export const fetchGoogleLinkUrl = async () => {
  return await apiRequest<OAuthRedirect>(api.post('/auth/google/link'))
}
