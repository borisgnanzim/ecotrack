<template>
  <div class="home-wrapper citizen">

    <div class="home-card">

      <img src="/assets/icon/eco-friendly.png" class="home-logo pulse" />

      <h1 class="home-title citizen-title">
        ECOTRACK Citoyen
      </h1>

      <p class="home-text">
        Signalez un problème, trouvez des conteneurs proches et contribuez à une ville plus propre 🌍
      </p>

      <div class="home-actions">

        <button @click="$router.push('/login')" class="btn-citizen">
          <i class="fa-solid fa-leaf"></i>
          Rejoindre la plateforme
        </button>

        <button @click="$router.push('/register')" class="btn-outline">
          Créer un compte citoyen
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
</style>
