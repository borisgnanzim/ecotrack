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
      path: '/manage-zones',
      name: 'manage-zones',
      component: () => import('../components/ManageZones/ManageZones.vue'),
      meta: {
        title: 'Manage Zones | Eko',
        requiresAuth: true,
        roles: ['admin'],
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

  // 3 + 4. Vérification token et rôles en un seul appel
  if (isAuthenticated && (to.meta.requiresAuth || to.meta.roles?.length)) {
    let userRoles = null
    try {
      userRoles = await authStorage.getDBRoles()
    } catch (err) {
      const status = err?.response?.status
      // Logout uniquement si le serveur confirme un token invalide/expiré
      // On ignore les erreurs réseau (status undefined) pour ne pas déconnecter inutilement
      if (status === 400 || status === 401) {
        console.log("Token invalide → logout")
        logout()
        return { name: 'login' }
      }
      // Erreur réseau ou serveur : on laisse passer sans vérification de rôle
      return
    }

    if (to.meta.roles?.length) {
      if (!userRoles || userRoles.length === 0) {
        return { name: 'forbidden' }
      }
      const hasAccess = userRoles.some(role => to.meta.roles.includes(role))
      if (!hasAccess) {
        return { name: 'forbidden' }
      }
    }
  }

  return true
})

export default router
