import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
    },
    {
      path: '/contain-management',
      name: 'contain-management',
      component: () => import('../components/containManagement/containManagement.vue'),
    },
    {
      path: '/user-space',
      name: 'user-space',
      component: () => import('../components/UserSpace/UserSpace.vue'),
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: () => import('../components/ManageUsers/ManageUsers.vue'),
    },
    {
      path: '/manage-routes',
      name: 'manage-routes',
      component: () => import('../components/ManageRoutes/ManageRoutes.vue'),
    },
  ],
})

export default router
