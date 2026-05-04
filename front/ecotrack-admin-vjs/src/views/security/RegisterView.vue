<template>
  <div class="auth-wrapper">
    <div class="auth-card">

      <div class="auth-header">
        <i class="bi bi-person-plus auth-logo"></i>
        <h1>ECOTRACK</h1>
        <p>Créer un compte citoyen ou agent</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">

        <div class="input-group">
          <i class="ri-user-line"></i>
          <input v-model="form.username" type="text" placeholder="Nom complet" />
        </div>

        <div class="input-group">
          <i class="ri-mail-line"></i>
          <input v-model="form.email" type="email" placeholder="Email" />
        </div>

        <div class="input-group">
          <i class="ri-lock-2-line"></i>
          <input v-model="form.password" type="password" placeholder="Mot de passe" />
        </div>

        <!-- Confirmation mot de passe -->
        <div class="input-group">
          <i class="ri-lock-password-line"></i>
          <input v-model="form.passwordConfirm" type="password" placeholder="Confirmer le mot de passe" />
        </div>

        <!-- Indications utilisateur -->
        <ul class="password-rules">
          <li :class="{ valid: passwordChecks.length }">6 à 100 caractères</li>
          <li :class="{ valid: passwordChecks.uppercase }">1 majuscule</li>
          <li :class="{ valid: passwordChecks.lowercase }">1 minuscule</li>
          <li :class="{ valid: passwordChecks.special }">1 caractère spécial</li>
        </ul>

        <p v-if="error" class="auth-error">
          <i class="ri-error-warning-line"></i>
          {{ error }}
        </p>

        <button class="auth-btn" :disabled="loading">
          <i class="ri-user-add-line"></i>
          {{ loading ? "Création..." : "Créer le compte" }}
        </button>

      </form>

      <div class="auth-footer">
        <span>Déjà un compte ?</span>
        <a @click="$router.push('/login')">Connexion</a>
      </div>

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
        passwordConfirm: ''
      },
      error: '',
      loading: false,
    }
  },

  computed: {
    passwordChecks() {
      const pwd = this.form.password

      return {
        length: pwd.length >= 6 && pwd.length <= 100,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        special: /[^A-Za-z0-9]/.test(pwd)
      }
    },

    isPasswordValid() {
      const c = this.passwordChecks
      return c.length && c.uppercase && c.lowercase && c.special
    }
  },

  methods: {
    async handleSubmit() {
      this.error = ''
      this.loading = true

      // Champs requis
      if (!this.form.username || !this.form.email || !this.form.password || !this.form.passwordConfirm) {
        this.error = 'Tous les champs sont requis'
        this.loading = false
        return
      }

      // Validation mot de passe
      if (!this.isPasswordValid) {
        this.error = 'Le mot de passe doit contenir 6 à 100 caractères, une majuscule, une minuscule et un caractère spécial'
        this.loading = false
        return
      }

      // Confirmation mot de passe
      if (this.form.password !== this.form.passwordConfirm) {
        this.error = 'Les mots de passe ne correspondent pas'
        this.loading = false
        return
      }

      try {
        const res = await authService.registerUser({
          username: this.form.username,
          email: this.form.email,
          password: this.form.password,
          passwordConfirm: this.form.passwordConfirm
        })

        console.log("réponse admin :", res)

        this.toast.success("Compte créé avec succès !")
        this.$router.push('/login')

      } catch (err) {

        const message =
          err.response?.data?.message ||
          "Erreur lors de l'inscription"

        this.error = message
        this.toast.error(message)

      } finally {
        this.loading = false
      }
    }
  },
}
</script>

<style scoped src="./auth.css"></style>
