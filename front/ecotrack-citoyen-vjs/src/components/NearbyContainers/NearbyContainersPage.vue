<template>
  <div class="min-h-screen bg-slate-100 text-slate-700">

    <AppHeader />

    <main class="max-w-5xl mx-auto px-6 py-10 space-y-6">

      <!-- Title -->
      <div>
        <h1 class="text-xl font-semibold">Conteneurs à proximité</h1>
        <p class="text-sm text-slate-500">
          Trouvez un conteneur près de vous
        </p>
      </div>

      <!-- Map placeholder -->
      <div class="map-box">
        Carte interactive (à venir)
      </div>

      <!-- List -->
      <div class="space-y-4">

        <div
          v-for="c in containers"
          :key="c.id"
          class="container-card"
        >

          <div class="flex justify-between">

            <div>
              <h3 class="font-medium">{{ c.code }}</h3>
              <p class="text-sm text-slate-500">{{ c.zone }}</p>
            </div>

            <span class="text-xs text-slate-400">
              {{ c.distance }} m
            </span>

          </div>

          <!-- Fill -->
          <div class="mt-3">

            <div class="flex justify-between text-xs mb-1 text-slate-500">
              <span>Remplissage</span>
              <span>{{ c.fill }}%</span>
            </div>

            <div class="progress">
              <div
                class="progress-bar"
                :class="fillColor(c.fill)"
                :style="{ width: c.fill + '%' }"
              ></div>
            </div>

          </div>

        </div>

      </div>

    </main>
  </div>
</template>


<script>
import AppHeader from "@/components/AppHeader/AppHeader.vue"

export default {

  components: { AppHeader },

  data() {
    return {
      containers: [
        { id: 1, code: "CTR-078", zone: "Centre-ville", fill: 45, distance: 120 },
        { id: 2, code: "CTR-014", zone: "Nord", fill: 82, distance: 300 },
        { id: 3, code: "CTR-032", zone: "Est", fill: 95, distance: 500 }
      ]
    }
  },

  methods: {

    fillColor(value) {
      if (value < 70) return "green"
      if (value < 90) return "orange"
      return "red"
    }

  }

}
</script>

<style scoped>
.container-card {
  background: white;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  transition: 0.2s;
}

.container-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

/* map */
.map-box {
  height: 200px;
  background: #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

/* progress */
.progress {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
}

.green { background: #10b981; }
.orange { background: #f59e0b; }
.red { background: #ef4444; }
</style>
