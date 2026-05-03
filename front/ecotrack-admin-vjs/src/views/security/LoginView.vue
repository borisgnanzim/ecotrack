<template>
  <div class="auth-wrapper">

    <div class="auth-card">

      <!-- BRAND -->
      <div class="auth-header">
        <i class="bi bi-recycle auth-logo"></i>

        <h1>ECOTRACK</h1>
        <p>Connexion à votre espace administrateur</p>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleSubmit" class="auth-form">

        <!-- EMAIL -->
        <div class="input-group">
          <i class="ri-mail-line"></i>
          <input v-model="form.email" type="email" placeholder="Email professionnel" />
        </div>

        <!-- PASSWORD -->
        <div class="input-group">
          <i class="ri-lock-2-line"></i>
          <input v-model="form.password" type="password" placeholder="Mot de passe" />
        </div>

        <p v-if="error" class="auth-error">
          <i class="ri-error-warning-line"></i>
          {{ error }}
        </p>

        <button class="auth-btn" :disabled="loading">
          <i class="ri-login-circle-line"></i>
          {{ loading ? "Connexion..." : "Se connecter" }}
        </button>

      </form>

      <!-- FOOTER -->
      <div class="auth-footer">
        <span>Pas de compte ?</span>
        <a @click="$router.push('/register')">Créer un compte</a>
      </div>

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
