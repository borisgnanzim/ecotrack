<template>
  <div class="dashboard">

    <AppHeader />

    <!-- Back -->
    <div class="max-w-6xl mx-auto px-6 mt-4">
      <BackButton />
    </div>

    <!-- Main -->
    <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">

      <!-- HEADER PROFIL -->
      <section class="profile-card">

        <div class="flex items-center gap-5">

          <!-- Avatar -->
          <div class="avatar-wrapper">
            <img :src="user.avatar" class="avatar" />

            <button class="avatar-edit">
              <i class="ri-camera-line"></i>
            </button>
          </div>

          <!-- Infos -->
          <div>
            <h2 class="text-xl font-semibold">
              {{ user.name }}
            </h2>

            <p class="text-slate-500 text-sm">
              {{ user.email }}
            </p>

            <span class="role-badge">
              {{ user.role }}
            </span>
          </div>

        </div>

        <div class="ml-auto flex flex-col items-end gap-3">

          <button class="btn-logout" @click="showLogout = true">
            <i class="ri-logout-box-r-line"></i>
            Déconnexion
          </button>

        </div>

      </section>

      <!-- INFOS -->
      <section class="card">

        <div class="card-header">
          <h3>Informations personnelles</h3>
          <button class="btn-ghost" @click="editMode = !editMode">
            <i class="ri-edit-line"></i>
            Modifier
          </button>
        </div>

        <div class="form-grid">

          <input v-model="form.name" :disabled="!editMode" class="input" placeholder="Nom" />
          <input v-model="form.email" :disabled="!editMode" class="input" placeholder="Email" />
          <input v-model="form.phone" :disabled="!editMode" class="input" placeholder="Téléphone" />

        </div>

        <div v-if="editMode" class="form-actions">
          <button class="btn-ghost" @click="cancelEdit">Annuler</button>
          <button class="btn-primary" @click="saveProfile">Enregistrer</button>
        </div>

      </section>

      <!-- PASSWORD -->
      <section class="card">

        <div class="card-header">
          <h3>Sécurité</h3>
        </div>

        <div class="form-grid">

          <input v-model="password.old" type="password" class="input" placeholder="Ancien mot de passe" />
          <input v-model="password.new" type="password" class="input" placeholder="Nouveau mot de passe" />
          <input v-model="password.confirm" type="password" class="input" placeholder="Confirmer" />

        </div>

        <div class="form-actions">
          <button class="btn-danger" @click="changePassword">
            <i class="ri-lock-password-line"></i>
            Modifier le mot de passe
          </button>
        </div>

      </section>

    </main>

    <!-- MODAL LOGOUT -->
    <div v-if="showLogout" class="modal-overlay">

      <div class="modal-logout animate-pop">

        <div class="text-center space-y-3">

          <div class="text-red-500 text-3xl">
            <i class="ri-logout-circle-line"></i>
          </div>

          <h3 class="text-lg font-semibold">
            Déconnexion
          </h3>

          <p class="text-sm text-slate-500">
            Voulez-vous vraiment quitter votre session ?
          </p>

        </div>

        <div class="flex justify-center gap-3 mt-6">

          <button class="btn-ghost" @click="showLogout = false">
            Annuler
          </button>

          <button class="btn-danger" @click="logout">
            Oui, se déconnecter
          </button>

        </div>

      </div>

    </div>
  </div>
</template>

<script>
import BackButton from "@/components/BackButton.vue"
import AppHeader from "@/components/AppHeader/AppHeader.vue"

export default {

  components: { AppHeader, BackButton },

  data() {
    return {

      editMode: false,

      user: {
        name: "Admin User",
        email: "admin@mail.com",
        role: "Citoyen",
        avatar: "https://i.pravatar.cc/100"
      },

      form: {
        name: "",
        email: "",
        phone: ""
      },

      password: {
        old: "",
        new: "",
        confirm: ""
      },

      showLogout: false

    }
  },

  mounted() {
    this.initForm()
  },

  methods: {

    initForm() {
      this.form = { ...this.user }
    },

    cancelEdit() {
      this.initForm()
      this.editMode = false
    },

    async saveProfile() {
      console.log("update profil", this.form)

      this.editMode = false
    },

    async changePassword() {

      if (this.password.new !== this.password.confirm) {
        alert("Les mots de passe ne correspondent pas")
        return
      }

      console.log("change password", this.password)

      this.password = {
        old: "",
        new: "",
        confirm: ""
      }

    },

    logout() {
      // clear futur auth
      localStorage.removeItem("token")

      this.showLogout = false

      this.$router.push("/login")
    }

  }

}
</script>

<style scoped>
.dashboard {
  background: linear-gradient(180deg, #f0fdf4 0%, #eaf7f0 100%);
}

.profile-card,
.card {
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.08);
}

.profile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 26px;
  padding: 28px;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 18px 40px rgba(5, 150, 105, 0.16);
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #059669;
  color: white;
  border-radius: 50%;
  padding: 10px;
  font-size: 14px;
  box-shadow: 0 12px 24px rgba(5, 150, 105, 0.18);
}

.profile-card h2 {
  font-size: 1.9rem;
  margin: 0;
}

.profile-card p {
  margin: 8px 0 0;
  color: #64748b;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 0.9rem;
  padding: 9px 16px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  font-weight: 600;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  color: #0f172a;
  padding: 14px 20px;
  border-radius: 18px;
  border: 1px solid rgba(16, 185, 129, 0.15);
  font-size: 0.95rem;
  font-weight: 600;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-logout:hover {
  transform: translateY(-1px);
  background: white;
}

.card {
  padding: 28px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #0f172a;
}

.form-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 980px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 16px;
}

.input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 18px;
  background: #f8fafc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.input:focus {
  border-color: #059669;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.btn-primary,
.btn-danger,
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary {
  background: #059669;
  color: white;
  padding: 14px 22px;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(5, 150, 105, 0.18);
}

.btn-primary:hover {
  background: #047857;
  transform: translateY(-1px);
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 14px 22px;
  border-radius: 18px;
}

.btn-danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.btn-ghost {
  color: #475569;
  padding: 14px 20px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-ghost:hover {
  background: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.modal-logout {
  background: white;
  padding: 32px;
  border-radius: 26px;
  width: min(100%, 520px);
  box-shadow: 0 32px 90px rgba(15, 23, 42, 0.18);
}

.modal-logout .text-center {
  text-align: center;
}

.modal-logout h3 {
  margin-top: 12px;
  font-size: 1.25rem;
}

.modal-logout p {
  margin-top: 10px;
  color: #64748b;
}

.modal-logout .btn-ghost,
.modal-logout .btn-danger {
  min-width: 140px;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-pop {
  animation: pop 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
