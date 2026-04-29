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
  ],
})

export default router
