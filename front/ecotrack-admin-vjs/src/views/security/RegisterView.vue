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

      try {
        await authService.registerUser(this.form)
        this.toast.success("Compte créé avec succès !")
        // Redirection vers login
        this.$router.push('/login')

      } catch (err) {
        console.log('Erreur inscription :', err)
        this.error = "Erreur lors de l'inscription"
        this.toast.error("Erreur lors de l'inscription")
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped src="./auth.css"></style>
