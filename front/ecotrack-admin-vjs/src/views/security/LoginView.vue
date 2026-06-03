<template>
  <div class="auth-wrapper">

    <div class="auth-card">

      <!-- BRAND -->
      <div class="auth-header">
        <div class="auth-brand">
          <i class="bi bi-recycle auth-logo"></i>
          <div>
            <h1 class="auth-title">ECOTRACK</h1>
            <p class="auth-subtitle">Connexion à votre espace administrateur</p>
          </div>
        </div>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleSubmit" class="auth-form">

        <!-- EMAIL -->
        <div class="input-group">
          <i class="input-icon ri-mail-line"></i>
          <input class="auth-input with-icon" v-model="form.email" type="email" placeholder="Email professionnel" />
        </div>

        <!-- PASSWORD -->
        <div class="input-group">
          <i class="input-icon ri-lock-2-line"></i>
          <input class="auth-input with-icon" v-model="form.password" type="password" placeholder="Mot de passe" />
        </div>

        <!-- REMEMBER ME -->
        <div class="remember-me">
          <label>
            <input type="checkbox" v-model="rememberMe" />
            Se souvenir de moi
          </label>
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
      <!--<div class="auth-footer">
        <span>Pas de compte ?</span>
        <a @click="$router.push('/register')">Créer un compte</a>
      </div>-->

    </div>

  </div>
</template>

<script>
import authService from '@/services/authentication/authService'
import { useToast } from 'vue-toastification'
import whosRole from '@/services/roles/whosRole';

export default {
  name: 'LoginPage',

  data() {
    return {
      toast: useToast(),
      form: {
        email: '',
        password: '',
      },
      rememberMe: false,
      error: '',
      loading: false,
      isAdmin: false,
      isAgent: false
    }
  },

  mounted() {
    // Pré-remplissage email
    const saved = localStorage.getItem('rememberMeData')

    if (saved) {
      const data = JSON.parse(saved)
      this.form.email = data.email
      this.rememberMe = true
    }
  },

  methods: {
    async handleSubmit() {
      this.error = ''
      this.loading = true

      try {
        const res = await authService.loginUser(this.form)
        this.toast.success("Connexion réussie")

        const token = res.data.token
        const userId = res.data.user.id
        const roles = res.data.roles

        if (this.rememberMe) {
          localStorage.setItem('token', token)
          localStorage.setItem('userId', userId)
          localStorage.setItem('roles', JSON.stringify(roles))

          localStorage.setItem(
            'rememberMeData',
            JSON.stringify({ email: this.form.email })
          )

        } else {
          sessionStorage.setItem('token', token)
          sessionStorage.setItem('userId', userId)
          sessionStorage.setItem('roles', JSON.stringify(roles))

          localStorage.removeItem('rememberMeData')
        }

        this.isAdmin = await whosRole.isAdmin()
        this.isAgent = await whosRole.isAgent()

        if(this.isAdmin) {
          this.$router.push('/dashboard')
        } else if(this.isAgent) {
          this.$router.push('/my-routes')
        } else {
          this.toast.error("Rôle utilisateur inconnu")
        }

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
