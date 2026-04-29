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

  </div>

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
/* Profil */
.profile-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

/* Avatar */
.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
}

.avatar-edit {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background: #059669;
  color: white;
  border-radius: 50%;
  padding: 6px;
  font-size: 12px;
}

/* Badge */
.role-badge {
  display: inline-block;
  margin-top: 6px;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
}

/* Card */
.card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

/* Form */
.form-grid {
  display: grid;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  gap: 10px;
}

/* Inputs */
.input {
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

/* Boutons */
.btn-primary {
  background: #059669;
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 10px 14px;
  border-radius: 10px;
}

.btn-ghost {
  color: #64748b;
}

/* LOGOUT BUTTON */
.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fee2e2;
  color: #b91c1c;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  transition: 0.2s;
  cursor: pointer;
}

.btn-logout:hover {
  background: #fecaca;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-logout {
  background: white;
  padding: 24px;
  border-radius: 18px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.15);
}

/* ANIMATION */
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
