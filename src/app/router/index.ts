import { useAuthPromptStore, useAuthStore } from '@/modules/auth'
import { useUserStore } from '@/modules/user'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/pages/MainPage/MainPage.vue'),
    },
    {
      path: '/catalog',
      redirect: { name: 'main' },
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
    {
      path: '/games/:id',
      name: 'game-details',
      component: () => import('@/pages/GameDetailPage/GameDetailPage.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/pages/AdminPage/AdminPage.vue'),
      meta: {
        requiresAdmin: true,
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          redirect: { name: 'admin-games' },
        },
        {
          path: 'games',
          name: 'admin-games',
          component: () => import('@/pages/AdminPage/AdminGamesPage.vue'),
        },
        {
          path: 'games/new',
          name: 'admin-game-create',
          component: () => import('@/pages/AdminPage/AdminGameCreatePage.vue'),
        },
        {
          path: 'tags',
          name: 'admin-tags',
          component: () => import('@/pages/AdminPage/AdminTagsPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const requiresAuth = Boolean(to.meta.requiresAuth || to.meta.requiresAdmin)

  if (!requiresAuth) {
    return true
  }

  const authStore = useAuthStore()
  const authPromptStore = useAuthPromptStore()
  const userStore = useUserStore()

  const requestLogin = () => {
    userStore.clearCurrentUser()
    authStore.markSessionInitialized()
    authPromptStore.requestAuthPrompt()
    return { name: 'main' }
  }

  if (!authStore.isAuthenticated) {
    try {
      const hasSession = await authStore.refreshSession()
      if (!hasSession) {
        return requestLogin()
      }
    } catch {
      return requestLogin()
    }
  }

  if (!to.meta.requiresAdmin) {
    return true
  }

  try {
    const currentUser = userStore.user ?? (await userStore.loadCurrentUser())

    if (currentUser.role !== 'admin') {
      return { name: 'profile' }
    }

    return true
  } catch {
    return requestLogin()
  }
})

export default router
