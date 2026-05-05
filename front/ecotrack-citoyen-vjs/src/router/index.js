import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import authStorage from '@/services/authStorage'
import { logout } from '@/services/authStorage'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/security/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/security/RegisterView.vue'),
    },
    {
      path: '/citizen-profile',
      name: 'citizen-profile',
      component: () => import('../components/profile/profileCitoyen.vue'),
    },
    {
      path: '/signalements',
      name: 'signalements',
      component: () => import('../components/signalements/signalementComp.vue'),
    },

    {
      path: '/my-signalements',
      name: 'my-signalements',
      component: () => import('../components/CitizenReport/CitizenReportsPage.vue'),
    },
    {
      path: '/nearby-containers',
      name: 'nearby-containers',
      component: () => import('../components/NearbyContainers/NearbyContainersPage.vue'),
    },

    {
      // Route pour accès réfusé
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('@/views/security/ForbiddenPage.vue'),
    },
    {
      // Route pour la page NotFound
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/security/NotFound.vue'),
    },
  ],
})

// Auth guard
router.beforeEach((to) => {
  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')

  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  return true
})

// Vérification des rôles
router.beforeEach(async (to) => {
  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')

  const isAuthenticated = !!token

  // PAS CONNECTÉ → on ne check PAS les rôles
  if (!isAuthenticated) {
    return true
  }

  // PAS DE ROLES REQUIS → OK
  if (!to.meta.roles || to.meta.roles.length === 0) {
    return true
  }

  try {
    const userRoles = await authStorage.getDBRoles()
    console.log("on a les rôles ", userRoles)

    if (!userRoles || userRoles.length === 0) {
      return { name: 'forbidden' }
    }

    const hasAccess = userRoles.some(role =>
      to.meta.roles.includes(role)
    )

    if (!hasAccess) {
      return { name: 'forbidden' }
    }

    return true

  } catch (err) {
    console.log("Erreur roles :", err)

    // vraie déconnexion
    logout()

    return { name: 'login' }
  }
})

export default router
