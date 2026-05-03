<template>
  <div class="auth-wrapper">

    <div class="auth-card">

      <h1 class="auth-title">
        <img src="/assets/icon/planet-earth.png" alt="Planète Terre"/>
        ECOTRACK
      </h1>

      <p class="auth-subtitle">
        Espace citoyen responsable
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4 mt-6">

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
          />
        </div>

        <p v-if="error" class="auth-error">
          {{ error }}
        </p>

        <button class="auth-btn">
          <i class="fa-solid fa-leaf"></i>
          Entrer dans l’espace citoyen
        </button>

      </form>

      <p class="text-center text-sm mt-5">
        Pas encore de compte ?
        <span class="auth-link" @click="$router.push('/register')">
          Rejoindre la communauté
        </span>
      </p>

    </div>

  </div>
</template>

<script>
import authService from '@/services/authentication/authService'
import { useToast } from 'vue-toastification'

export default {
  name: 'LoginPage',

  data() {
    return {
      toast: useToast(),
      form: {
        email: '',
        password: '',
      },
      error: '',
      loading: false,
    }
  },

  mounted() {
    // On va ajouter ce qu'il faut
  },

  methods: {
    async handleSubmit() {
      this.error = ''
      this.loading = true

      try {
        const res = await authService.loginUser(this.form)
        this.toast.success("Connexion réussie")

        // Stockage du token
        localStorage.setItem('token', res.data.token)

        // Redirection (équivalent router.push)
        this.$router.push('/dashboard')

      } catch (err) {
        console.log('Erreur de connexion :', err)

        const message =
          err.response?.data?.message ||
          'Email ou mot de passe incorrect'

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
