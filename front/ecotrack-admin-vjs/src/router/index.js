import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import authStorage from '@/services/authStorage'
import { logout } from '@/services/authStorage'
import whosRole from '@/services/roles/whosRole';

const APP_AUTH_URL = import.meta.env.VITE_APP_AUTH_URL

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Ekotrack Admin',
        requiresAuth: false,
        roles: [],
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/security/LoginView.vue'),
      meta: {
        title: 'Ekotrack Admin',
        requiresAuth: false,
        roles: [],
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/security/RegisterView.vue'),
      meta: {
        title: 'Ekotrack Admin',
        requiresAuth: false,
        roles: [],
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../components/dashboard/adminDashboard.vue'),
      meta: {
        title: 'Dashboard | Eko',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/contain-management',
      name: 'contain-management',
      component: () => import('../components/containManagement/containManagement.vue'),
      meta: {
        title: 'Manage Container | Eko',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/user-space',
      name: 'user-space',
      component: () => import('../components/UserSpace/UserSpace.vue'),
      meta: {
        title: 'Space User | Eko',
        requiresAuth: true,
        roles: ['admin', 'agent', 'manager'],
      },
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('../components/ManageUsers/ManageUsers.vue'),
      meta: {
        title: 'Manage Users | Eko',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/manage-routes',
      name: 'manage-routes',
      component: () => import('../components/ManageRoutes/ManageRoutes.vue'),
      meta: {
        title: 'Routes | Eko',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    // Les tournées d'un agent
    {
      path: '/my-routes',
      name: 'my-routes',
      component: () => import('../components/ManageRoutes/MyRoutes.vue'),
      meta: {
        title: 'My Routes | Eko',
        requiresAuth: true,
        roles: ['agent', 'manager'],
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
