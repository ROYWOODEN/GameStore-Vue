import { createRouter, createWebHistory } from 'vue-router'

import { useAuthPromptStore, useAuthStore } from '@/modules/auth'
import { useUserStore } from '@/modules/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/pages/MainPage/MainPage.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/ProfilePage/ProfilePage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/pages/FavoritesPage/FavoritesPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/basket',
      name: 'basket',
      component: () => import('@/pages/BasketPage/BasketPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/pages/LibraryPage/LibraryPage.vue'),
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
  const authPromptStore = useAuthPromptStore()
  const userStore = useUserStore()
  if (authStore.isAuthenticated) {
    return true
  }

  try {
    const hasSession = await authStore.refreshSession()
    if (!hasSession) {
      userStore.clearCurrentUser()
      authStore.markSessionInitialized()
      authPromptStore.requestAuthPrompt()
      return { name: 'main' }
    }

    return true
  } catch {
    userStore.clearCurrentUser()
    authStore.markSessionInitialized()
    authPromptStore.requestAuthPrompt()
    return { name: 'main' }
  }
})

export default router
