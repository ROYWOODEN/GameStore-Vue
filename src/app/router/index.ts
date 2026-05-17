import { createRouter, createWebHistory } from 'vue-router'

import { fetchRefresh } from '@/modules/auth/api/auth.api'
import { useAuthStore } from '@/modules/auth/stores/auth.store'
import MainPage from '@/pages/MainPage/MainPage.vue'
import ProfilePage from '@/pages/ProfilePage/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainPage,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    return true
  }

  const authStore = useAuthStore()
  if (authStore.isAuthenticated) {
    return true
  }

  try {
    const session = await fetchRefresh()
    authStore.setAccessToken(session.accessToken)
    return true
  } catch {
    authStore.clearSession()
    authStore.markSessionInitialized()
    return { name: 'main' }
  }
})

export default router
