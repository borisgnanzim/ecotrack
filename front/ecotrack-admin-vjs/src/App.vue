<template>
  <div id="app">
    <!-- Si la route est 'Home', afficher directement le composant Home -->
    <Home v-if="$route.name === 'home'" />

    <!-- Sinon, on peut afficher les autres composants via router-view -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script>
import Home from './views/HomeView.vue'

export default {
  components: {
    Home,
  },
}
</script>
