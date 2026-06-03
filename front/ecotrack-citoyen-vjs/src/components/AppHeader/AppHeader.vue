<template>
  <header class="app-header">
    <div class="header-wrapper">

      <div class="header-top">
        <div>
          <h1 class="logo">
            {{ getTitle() }}
          </h1>
          <p v-if="getSubtitle()" class="subtitle">
            {{ getSubtitle() }}
          </p>
        </div>

        <div class="header-actions">
          <div class="icon-btn" title="Notifications">
            <i class="ri-notification-line"></i>
          </div>

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

      <nav class="nav-bar">
        <router-link
          to="/signalements"
          class="nav-item"
          :class="{ active: isActive('/signalements') }"
        >
          Signaler
        </router-link>

        <router-link
          to="/my-signalements"
          class="nav-item"
          :class="{ active: isActive('/my-signalements') }"
        >
          Mes signalements
        </router-link>

        <router-link
          to="/nearby-containers"
          class="nav-item"
          :class="{ active: isActive('/nearby-containers') }"
        >
          À proximité
        </router-link>
      </nav>

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
  background: linear-gradient(135deg, #059669 0%, #0f766e 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 60;
  box-shadow: 0 16px 40px rgba(5, 150, 105, 0.2);
}

.header-wrapper {
  max-width: 1200px;
  margin: auto;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 22px 24px 14px;
}

.logo {
  font-size: 26px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.02em;
}

.subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 8px;
  max-width: 560px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.24);
  transform: translateY(-1px);
}

.profile {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  background: rgba(255, 255, 255, 0.14);
  padding: 10px 14px;
  border-radius: 20px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: white;
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
}

.username {
  font-size: 0.95rem;
  font-weight: 600;
}

.nav-bar {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px 22px;
  background: rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(14px);
}

.nav-item {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;
  padding: 12px 18px;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.18);
}

.nav-item.active {
  background: white;
  color: #0f172a;
  font-weight: 700;
}

@media (max-width: 820px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
