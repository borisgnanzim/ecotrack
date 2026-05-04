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

          <!--<i class="fa-regular fa-envelope input-icon"></i>-->

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

          <!--<i class="fa-solid fa-lock input-icon"></i>-->

          <input
            v-model="form.password"
            type="password"
            class="auth-input with-icon"
            placeholder="••••••••"
          />
        </div>

        <!-- REMEMBER ME -->
        <div class="remember-me">
          <label>
            <input type="checkbox" v-model="rememberMe" />
            Se souvenir de moi
          </label>
        </div>

        <p v-if="error" class="auth-error">
          {{ error }}
        </p>

        <button class="auth-btn" :disabled="loading">
          <i class="fa-solid fa-leaf"></i>
          {{ loading ? "Connexion..." : "Entrer dans l’espace citoyen" }}
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
      rememberMe: false,
      error: '',
      loading: false,
    }
  },

  mounted() {
    // Charger les infos sauvegardées
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

        this.$router.push('/signalements')

      } catch (err) {

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
