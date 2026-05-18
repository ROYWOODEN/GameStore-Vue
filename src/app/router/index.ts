import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/modules/auth/stores/auth.store'
import { useUserStore } from '@/modules/user/stores/user.store'
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
  const userStore = useUserStore()
  if (authStore.isAuthenticated) {
    return true
  }

  try {
    const hasSession = await authStore.refreshSession()
    if (!hasSession) {
      userStore.clearCurrentUser()
      authStore.markSessionInitialized()
      return { name: 'main' }
    }

    return true
  } catch {
    userStore.clearCurrentUser()
    authStore.markSessionInitialized()
    return { name: 'main' }
  }
})

export default router
