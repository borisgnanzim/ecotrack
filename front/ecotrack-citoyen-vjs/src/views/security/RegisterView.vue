<template>
  <div class="auth-wrapper">

    <div class="auth-card">

      <h1 class="auth-title">
        <img src="/assets/icon/biodegradable.png" alt="Feuille"/>
        ECOTRACK
      </h1>

      <p class="auth-subtitle">
        Rejoindre les citoyens écoresponsables
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4 mt-6">

        <!-- USERNAME -->
        <div class="input-group">
          <label class="auth-label">
            <i class="fa-solid fa-user"></i>
            Nom complet
          </label>

          <i class="fa-solid fa-user input-icon"></i>

          <input
            v-model="form.username"
            class="auth-input with-icon"
            placeholder="Jean Dupont"
          />
        </div>

        <!-- EMAIL -->
        <div class="input-group">
          <label class="auth-label">
            <i class="fa-regular fa-envelope"></i>
            Email
          </label>

          <i class="fa-regular fa-envelope input-icon"></i>

          <input
            v-model="form.email"
            class="auth-input with-icon"
            placeholder="citoyen@mail.com"
          />
        </div>

        <!-- PASSWORD -->
        <div class="input-group">
          <label class="auth-label">
            <i class="fa-solid fa-lock"></i>
            Mot de passe
          </label>

          <i class="fa-solid fa-lock input-icon"></i>

          <input
            v-model="form.password"
            type="password"
            class="auth-input with-icon"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="auth-error">
          {{ error }}
        </p>

        <button class="auth-btn">
          <i class="fa-solid fa-seedling"></i>
          Créer mon compte citoyen
        </button>

      </form>

      <p class="text-center text-sm mt-5">
        Déjà inscrit ?
        <span class="auth-link" @click="$router.push('/login')">
          Connexion
        </span>
      </p>

    </div>

  </div>
</template>

<script>
import authService from '@/services/authentication/authService'
import { useToast } from "vue-toastification"

export default {
  name: 'RegisterPage',

  data() {
    return {
      toast: useToast(),

      form: {
        username: '',
        email: '',
        password: '',
      },
      error: '',
      loading: false,
    }
  },

  mounted() {
    // A ajouter ce qu'il faut
  },

  methods: {
    async handleSubmit() {
      this.error = ''
      this.loading = true

      // Validation
      if (!this.form.username || !this.form.email || !this.form.password) {
        this.error = 'Tous les champs sont requis'
        this.loading = false
        return
      }

      try {
        await authService.registerUser({
          name: this.form.username,
          email: this.form.email,
          password: this.form.password,
        })

        this.toast.success("Compte créé avec succès !")

        this.$router.push('/login')

      } catch (err) {
        console.log('Erreur inscription :', err)

        const message =
          err.response?.data?.message ||
          "Erreur lors de l'inscription"

        this.error = message
        this.toast.error(message)

      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped src="./auth.css"></style>
