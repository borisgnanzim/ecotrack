<template>
  <div class="home-wrapper admin">

    <div class="home-card">

      <img src="/assets/icon/web-dashboard.png" class="home-logo pulse" />

      <h1 class="home-title admin-title">
        ECOTRACK Admin
      </h1>

      <p class="home-text">
        Supervisez les conteneurs, planifiez les tournées et optimisez la gestion urbaine en temps réel.
      </p>

      <!-- mini stats preview -->
      <div class="home-stats">

        <div class="stat">
          <i class="fa-solid fa-truck"></i>
          <span>12 tournées</span>
        </div>

        <div class="stat">
          <i class="fa-solid fa-dumpster"></i>
          <span>148 conteneurs</span>
        </div>

        <div class="stat">
          <i class="fa-solid fa-user-shield"></i>
          <span>6 agents</span>
        </div>

      </div>

      <div class="home-actions">

        <button @click="$router.push('/login')" class="btn-admin">
          <i class="fa-solid fa-right-to-bracket"></i>
          Accéder au dashboard
        </button>

        <button @click="$router.push('/dashboard')" class="btn-outline">
          Mode démo
        </button>

      </div>

    </div>

  </div>
</template>

<style scoped>
/* WRAPPER */
.home-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #d1fae5, #ffffff 40%, #ecfdf5);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* soft background shapes */
.home-wrapper::before,
.home-wrapper::after {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  filter: blur(60px);
}

.home-wrapper::before {
  top: -80px;
  left: -80px;
}

.home-wrapper::after {
  bottom: -80px;
  right: -80px;
}

/* CARD */
.home-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 40px 28px;
  border-radius: 20px;
  max-width: 520px;
  text-align: center;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.08);
}

/* LOGO */
.home-logo {
  width: 70px;
  margin-bottom: 12px;
}

.pulse {
  animation: pulse 2.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* TITLE */
.home-title {
  font-size: 34px;
  font-weight: 800;
  color: #059669;
  margin-bottom: 10px;
}

.citizen-title {
  color: #10b981;
}

/* TEXT */
.home-text {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 25px;
  line-height: 1.6;
}

/* ACTIONS */
.home-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* BUTTONS */
.btn-admin,
.btn-citizen {
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-admin {
  background: linear-gradient(135deg, #065f46, #059669);
}

.btn-citizen {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.btn-admin:hover,
.btn-citizen:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25);
}

/* OUTLINE BUTTON */
.btn-outline {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: transparent;
  font-weight: 500;
  color: #334155;
  transition: 0.2s;
}

.btn-outline:hover {
  border-color: #10b981;
  color: #059669;
}

/* ADMIN THEME */
.home-wrapper.admin {
  background: radial-gradient(circle at top, #e2e8f0, #ffffff 45%, #f1f5f9);
}

/* TITLE ADMIN */
.admin-title {
  color: #0f172a;
}

/* ICON LOGO */
.home-logo {
  width: 72px;
  margin-bottom: 14px;
}

/* STATS */
.home-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 18px 0;
}

.stat {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #334155;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.stat i {
  font-size: 16px;
  color: #059669;
}

/* ADMIN BUTTON */
.btn-admin {
  background: linear-gradient(135deg, #0f172a, #334155);
  color: white;
}

/* hover commun propre */
.btn-admin:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.25);
}
</style>
