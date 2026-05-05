<template>
  <div class="auth-wrapper">

    <div class="auth-card text-center">

      <div class="auth-header">
        <i class="ri-error-warning-line auth-logo error-404"></i>

        <h1 class="error-404">404</h1>
        <p>Page introuvable</p>
      </div>

      <p class="text-sm text-slate-500 mb-4">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>

      <button class="auth-btn btn-404" @click="goBack">
        <i class="ri-arrow-left-line"></i>
        Retour
      </button>

    </div>

  </div>
</template>

<script>
export default {
  name: "NotFoundPage",

  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/') // fallback logique
      }
    }
  }
}
</script>

<style scoped src="./auth.css"></style>

<style scoped>
.error-404 {
  color: #f59e0b; /* orange */
}

.btn-404 {
  background: #f59e0b;
}

.btn-404:hover {
  background: #d97706;
}
</style>
