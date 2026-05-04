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

        <!-- FIRSTNAME -->
        <div class="input-group">
          <label class="auth-label">
            <i class="fa-solid fa-user"></i>
            Prénom
          </label>

          <input
            v-model="form.firstname"
            class="auth-input with-icon"
            placeholder="Jean"
          />
        </div>

        <!-- LASTNAME -->
        <div class="input-group">
          <label class="auth-label">
            <i class="fa-solid fa-user"></i>
            Nom
          </label>

          <input
            v-model="form.lastname"
            class="auth-input with-icon"
            placeholder="Dupont"
          />
        </div>

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

        <!-- CONFIRM PASSWORD -->
        <div class="input-group">
          <label class="auth-label">
            <i class="fa-solid fa-lock"></i>
            Confirmer le mot de passe
          </label>

          <!--<i class="fa-solid fa-lock input-icon"></i>-->

          <input
            v-model="form.passwordConfirm"
            type="password"
            class="auth-input with-icon"
            placeholder="••••••••"
          />
        </div>

        <!-- RÈGLES MOT DE PASSE -->
        <ul class="password-rules">
          <li :class="{ valid: passwordChecks.length }">6 à 100 caractères</li>
          <li :class="{ valid: passwordChecks.uppercase }">1 majuscule</li>
          <li :class="{ valid: passwordChecks.lowercase }">1 minuscule</li>
          <li :class="{ valid: passwordChecks.special }">1 caractère spécial</li>
        </ul>

        <p v-if="error" class="auth-error">
          {{ error }}
        </p>

        <button class="auth-btn" :disabled="loading">
          <i class="fa-solid fa-seedling"></i>
          {{ loading ? "Création..." : "Créer mon compte citoyen" }}
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
        firstname: '',
        lastname: '',
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

    formatFirstname(name) {
      return name
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    },

    formatLastname(name) {
      if (!name) return ''
      return name.toUpperCase()
    },

    async handleSubmit() {
      this.error = ''
      this.loading = true

      // Champs requis
      if (!this.form.firstname || !this.form.lastname || !this.form.email || !this.form.password || !this.form.passwordConfirm) {
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

      // Vérification confirmation
      if (this.form.password !== this.form.passwordConfirm) {
        this.error = 'Les mots de passe ne correspondent pas'
        this.loading = false
        return
      }

      try {
        const formattedFirstname = this.formatFirstname(this.form.firstname.trim())
        const formattedLastname = this.formatLastname(this.form.lastname.trim())

        const res = await authService.registerUser({
          firstname: formattedFirstname,
          lastname: formattedLastname,
          email: this.form.email.trim(),
          password: this.form.password,
          passwordConfirm: this.form.passwordConfirm
        })

        const token = res.data.token
        const userId = res.data.user.id
        const roles = res.data.roles

        this.toast.success("Compte citoyen créé avec succès !")

        localStorage.setItem('token', token)
        localStorage.setItem('userId', userId)
        localStorage.setItem('roles', JSON.stringify(roles))

        this.$router.push('/signalements')

      } catch (err) {

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
