import type { Router, RouteLocationRaw } from 'vue-router'

export const goBackOrPush = async (router: Router, fallback: RouteLocationRaw): Promise<void> => {
  const previousRoute = window.history.state?.back

  if (typeof previousRoute === 'string' && previousRoute) {
    router.back()
    return
  }

  await router.push(fallback)
}
