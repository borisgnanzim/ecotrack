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
import whosRole from '@/services/roles/whosRole';

export default {
  name: "AppHeader",

  setup() {

    const route = useRoute()
    const isAdmin = ref(false)
    const isAgent = ref(false)

    const user = ref({
      name: '',
      initials: ''
    })

    const navItems = ref([])

    const buildNavItems = ({ admin, agent }) => {
      const items = []

      if (admin) {
        items.push(
          { label: "Dashboard", path: "/dashboard" },
          { label: "Conteneurs", path: "/contain-management" },
          { label: "Utilisateurs", path: "/user-management" },
          { label: "Les tournées", path: "/manage-routes" }
        )
      }

      if (agent) {
        items.push({ label: "Mes tournées", path: "/my-routes" })
      }

      navItems.value = items
    }

    const isActive = (path) => route.path === path

    const getTitle = () => {
      switch (route.path) {
        case '/dashboard': return 'ECOTRACK'
        case '/contain-management': return 'Gestion des conteneurs'
        case '/user-management': return 'Gestion des utilisateurs'
        case '/manage-routes': return 'Gestion des tournées'
        case '/my-routes': return 'Mes tournées'
        default: return 'ECOTRACK'
      }
    }

    const getSubtitle = () => {
      switch (route.path) {
        case '/dashboard': return 'Tableau de bord administrateur'
        case '/contain-management': return 'Suivi des conteneurs'
        case '/user-management': return 'Gestion des comptes utilisateurs'
        case '/manage-routes': return 'Planification des tournées et affectation'
        case '/my-routes': return 'Suivi de vos tournées en cours'
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

    const initRoles = async () => {
      try {
        const [admin, agent] = await Promise.all([
          whosRole.isAdmin(),
          whosRole.isAgent()
        ])
        isAdmin.value = admin
        isAgent.value = agent
        buildNavItems({ admin, agent })
      } catch (err) {
        console.log('Erreur rôle :', err)
      }
    }

    onMounted(() => {
      fetchProfile()
      initRoles()
    })

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
  background: linear-gradient(135deg, #059669 0%, #0f766e 100%);
  color: white;
  border-bottom: none;
  box-shadow: 0 18px 40px rgba(5, 150, 105, 0.15);
  position: sticky;
  top: 0;
  z-index: 50;
}

/* NEW WRAPPER */
.header-wrapper {
  max-width: 1200px;
  margin: auto;
}

/* TOP BAR */
.header-container {
  padding: 22px 24px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.logo {
  font-size: 26px;
  width: max-content;
  font-weight: 700;
  color: white;
  letter-spacing: 0.03em;
}

.subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.78);
  margin-top: 6px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255,255,255,0.12);
  padding: 10px 14px;
  border-radius: 999px;
}

.agent {
  font-size: 14px;
  color: rgba(255,255,255,0.92);
}

.avatar {
  width: 40px;
  height: 40px;
  background: white;
  color: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 10px 24px rgba(0,0,0,0.12);
}

/* NAV BAR ALIGNÉE */
.nav-bar {
  display: flex;
  gap: 10px;
  padding: 14px 24px 18px;
  background: rgba(255,255,255,0.12);
  border-top: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(10px);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

/* ITEMS */
.nav-item {
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 999px;
  color: rgba(255,255,255,0.92);
  transition: 0.2s ease;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255,255,255,0.18);
  color: white;
}

.nav-item.active {
  background: white;
  color: #0f172a;
  font-weight: 600;
}
</style>
