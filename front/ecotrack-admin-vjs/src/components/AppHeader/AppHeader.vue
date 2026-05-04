<template>
  <header class="app-header">

    <div class="header-wrapper">

      <!-- TOP BAR -->
      <div class="header-container">

        <!-- Left -->
        <div>
          <h1 class="logo">
            {{ getTitle() }}
          </h1>

          <p v-if="getSubtitle()" class="subtitle">
            {{ getSubtitle() }}
          </p>
        </div>

        <!-- Right -->
        <div class="header-right">

          <span class="agent">
            Agent : <strong>{{ user.name }}</strong>
          </span>

          <router-link to="/user-space">
            <div class="avatar">
              {{ user.initials }}
            </div>
          </router-link>

        </div>

      </div>

      <!-- NAV BAR (dans le même container) -->
      <nav class="nav-bar">

        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.label }}
        </router-link>

      </nav>

    </div>

  </header>
</template>

<script>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import authStorage from '@/services/authStorage';

export default {
  name: "AppHeader",

  setup() {

    const route = useRoute()

    const user = ref({
      name: '',
      initials: ''
    })

    const navItems = [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Conteneurs", path: "/contain-management" },
      { label: "Utilisateurs", path: "/user-management" },
      { label: "Les tournées", path: "/manage-routes" }
    ]

    const isActive = (path) => route.path === path

    const getTitle = () => {
      switch (route.path) {
        case '/dashboard': return 'ECOTRACK'
        case '/contain-management': return 'Gestion des conteneurs'
        case '/user-management': return 'Gestion des utilisateurs'
        case '/manage-routes': return 'Gestion des tournées'
        default: return 'ECOTRACK'
      }
    }

    const getSubtitle = () => {
      switch (route.path) {
        case '/dashboard': return 'Tableau de bord administrateur'
        case '/contain-management': return 'Suivi des conteneurs'
        case '/user-management': return 'Gestion des comptes utilisateurs'
        default: return ''
      }
    }

    const fetchProfile = async () => {
      try {
        const res = await authStorage.getProfile()
        const userData = res.data || res

        user.value.name = userData.name || 'Utilisateur'

        user.value.initials = userData.name
          ? userData.name
              .split(' ')
              .filter(Boolean)
              .map(n => n[0])
              .join('')
              .toUpperCase()
          : ''

      } catch (err) {
        console.log("Erreur profil :", err)
      }
    }

    onMounted(fetchProfile)

    return {
      user,
      navItems,
      isActive,
      getTitle,
      getSubtitle
    }
  }
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* NEW WRAPPER */
.header-wrapper {
  max-width: 1200px;
  margin: auto;
}

/* TOP BAR */
.header-container {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 22px;
  width: max-content;
  font-weight: bold;
  color: #059669;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.agent {
  font-size: 14px;
  color: #64748b;
}

.avatar {
  width: 36px;
  height: 36px;
  background: #059669;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* NAV BAR ALIGNÉE */
.nav-bar {
  display: flex;
  gap: 8px;
  padding: 0 24px 12px 24px; /* 👈 même padding horizontal */
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

/* ITEMS */
.nav-item {
  font-size: 14px;
  padding: 8px 14px;
  border-radius: 10px;
  color: #64748b;
  transition: 0.2s;
  font-weight: 500;
}

.nav-item:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.nav-item.active {
  background: #059669;
  color: white;
}
</style>
