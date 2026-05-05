<template>
  <div class="auth-wrapper">

    <div class="auth-card text-center">

      <div class="auth-header">
        <i class="ri-shield-cross-line auth-logo error-403"></i>

        <h1 class="error-403">403</h1>
        <p>Accès refusé</p>
      </div>

      <p class="text-sm text-slate-500 mb-4">
        Vous n’avez pas les permissions nécessaires pour accéder à cette page.
      </p>

      <button class="auth-btn btn-403" @click="goBack">
        <i class="ri-arrow-left-line"></i>
        Retour
      </button>

    </div>

  </div>
</template>

<script>
export default {
  name: "ForbiddenPage",

  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/dashboard') // fallback logique
      }
    }
  }
}
</script>

<style scoped src="./auth.css"></style>

<style scoped>
.error-403 {
  color: #dc2626; /* rouge */
}

.btn-403 {
  background: #dc2626;
}

.btn-403:hover {
  background: #b91c1c;
}
</style>
