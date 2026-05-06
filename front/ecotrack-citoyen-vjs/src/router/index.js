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
      meta: {
        title: 'Space User | Eko',
        requiresAuth: true,
        roles: ['citizen'],
      },
    },
    {
      path: '/signalements',
      name: 'signalements',
      component: () => import('../components/signalements/signalementComp.vue'),
      meta: {
        title: 'Signalement | Eko',
        requiresAuth: true,
        roles: ['citizen'],
      },
    },

    {
      path: '/my-signalements',
      name: 'my-signalements',
      component: () => import('../components/CitizenReport/CitizenReportsPage.vue'),
      meta: {
        title: 'Mes signalement | Eko',
        requiresAuth: true,
        roles: ['citizen'],
      },
    },
    {
      path: '/nearby-containers',
      name: 'nearby-containers',
      component: () => import('../components/NearbyContainers/NearbyContainersPage.vue'),
      meta: {
        title: 'Container proche | Eko',
        requiresAuth: true,
        roles: ['citizen'],
      },
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

  // 1. Si connecté et va sur login/register → redirect dashboard
  if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' }
  }

  // 2. Si route protégée et pas connecté
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  // 3. Vérification token (expiration ou invalide)
  if (isAuthenticated) {
    try {
      // ici on appele une API pour vérifier expiration JWT
      await authStorage.getDBRoles() // test simple

    } catch (err) {
      console.log("Token invalide → logout")

      logout()

      return { name: 'login' }
    }
  }

  // 4. Vérification des rôles
  if (to.meta.roles && to.meta.roles.length > 0) {
    try {
      const userRoles = await authStorage.getDBRoles()

      if (!userRoles || userRoles.length === 0) {
        return { name: 'forbidden' }
      }

      const hasAccess = userRoles.some(role =>
        to.meta.roles.includes(role)
      )

      if (!hasAccess) {
        return { name: 'forbidden' }
      }

    } catch (err) {
      console.log("Erreur rôles :", err)

      logout()

      return { name: 'login' }
    }
  }

  return true
})

export default router
