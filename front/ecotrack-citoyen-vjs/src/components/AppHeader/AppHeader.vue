<template>
  <header class="app-header">
    <div class="header-container">

      <!-- LEFT -->
      <div class="header-left">

        <div>
          <h1 class="logo">
            {{ getTitle() }}
          </h1>

          <p v-if="getSubtitle()" class="subtitle">
            {{ getSubtitle() }}
          </p>
        </div>

        <!-- NAV rapide -->
        <nav class="nav-links">

          <router-link
            to="/signalements"
            :class="{ active: isActive('/signalements') }"
          >
            Signaler
          </router-link>

          <router-link
            to="/my-signalements"
            :class="{ active: isActive('/my-signalements') }"
          >
            Mes signalements
          </router-link>

          <router-link
            to="/nearby-containers"
            :class="{ active: isActive('/nearby-containers') }"
          >
            À proximité
          </router-link>

        </nav>

      </div>

      <!-- RIGHT -->
      <div class="header-right">

        <!-- Notification (future) -->
        <div class="icon-btn" title="Notifications">
          🔔
        </div>

        <!-- Profil -->
        <router-link to="/citizen-profile" class="profile">
          <div class="avatar">
            <i class="ri-user-line"></i>
          </div>
          <span class="username">
            {{ user.name }}
          </span>
        </router-link>

      </div>

    </div>
  </header>
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  name: "AppHeader",

  setup() {

    const route = useRoute()

    const user = {
      name: "Martin D.",
    }

    const isActive = (path) => {
      return route.path === path
    }

    const getTitle = () => {
      switch (route.path) {
        case '/signalements':
          return 'Nouveau signalement'
        case '/my-signalements':
          return 'Mes signalements'
        case '/nearby-containers':
          return 'Conteneurs à proximité'
        case '/citizen-profile':
          return 'Mon profil'
        default:
          return 'ECOTRACK'
      }
    }

    const getSubtitle = () => {
      switch (route.path) {
        case '/signalements':
          return 'Signalez un problème rapidement'
        case '/my-signalements':
          return 'Suivez vos signalements'
        case '/nearby-containers':
          return 'Trouvez un point de dépôt proche'
        case '/citizen-profile':
          return 'Gérez vos informations personnelles'
        default:
          return 'Agissez pour une ville plus propre'
      }
    }

    return {
      user,
      getTitle,
      getSubtitle,
      isActive
    }
  }
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-container {
  max-width: 1200px;
  margin: auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* LEFT */
.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
}

.subtitle {
  font-size: 12px;
  color: #64748b;
}

/* NAV */
.nav-links {
  display: flex;
  gap: 16px;
  margin-top: 6px;
}

.nav-links a {
  font-size: 13px;
  color: #64748b;
  text-decoration: none;
  transition: 0.2s;
}

.nav-links a:hover {
  color: #059669;
}

/* RIGHT */
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* ICON BUTTON */
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.icon-btn:hover {
  background: #e2e8f0;
}

/* PROFILE */
.profile {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #059669;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.username {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.nav-links a.active {
  color: #059669;
  font-weight: 600;
  position: relative;
}

/* petit underline moderne */
.nav-links a.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 2px;
  background: #059669;
  border-radius: 10px;
}
</style>
