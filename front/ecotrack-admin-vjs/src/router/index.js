import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { logout } from '@/services/authStorage'

const APP_AUTH_URL = import.meta.env.VITE_APP_AUTH_URL

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
        title: 'Dashboard | Eko',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/user-space',
      name: 'user-space',
      component: () => import('../components/UserSpace/UserSpace.vue'),
      meta: {
        title: 'Dashboard | Eko',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('../components/ManageUsers/ManageUsers.vue'),
      meta: {
        title: 'Dashboard | Eko',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: '/manage-routes',
      name: 'manage-routes',
      component: () => import('../components/ManageRoutes/ManageRoutes.vue'),
      meta: {
        title: 'Dashboard | Eko',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
})

// Auth guard
router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    return `/login`
  }

  return true
})

export default router
