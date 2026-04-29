<template>
  <div class="min-h-screen bg-slate-100 text-slate-700">

    <!-- Header -->
    <AppHeader />

    <main class="max-w-5xl mx-auto px-6 py-10 space-y-6">

      <!-- Title -->
      <div>
        <h1 class="text-xl font-semibold">Mes signalements</h1>
        <p class="text-sm text-slate-500">
          Suivez l’état de vos signalements
        </p>
      </div>

      <!-- List -->
      <div class="space-y-4">

        <div
          v-for="r in reports"
          :key="r.id"
          class="report-card"
        >

          <div class="flex justify-between items-start">

            <div>
              <h3 class="font-medium">
                {{ r.container }}
              </h3>
              <p class="text-sm text-slate-500">
                {{ r.type }}
              </p>
            </div>

            <span :class="statusClass(r.status)">
              {{ r.status }}
            </span>

          </div>

          <p class="text-sm mt-2 text-slate-600">
            {{ r.description }}
          </p>

          <div class="flex justify-between items-center mt-3 text-xs text-slate-400">
            <span>{{ r.date }}</span>

            <button class="text-emerald-600 hover:underline">
              Voir détails
            </button>
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
      reports: [
        {
          id: 1,
          container: "CTR-078",
          type: "Débordement",
          description: "Le conteneur est plein depuis 2 jours",
          status: "EN ATTENTE",
          date: "12 Mars 2026"
        },
        {
          id: 2,
          container: "CTR-014",
          type: "Odeur inhabituelle",
          description: "Forte odeur près du conteneur",
          status: "EN COURS",
          date: "10 Mars 2026"
        },
        {
          id: 3,
          container: "CTR-032",
          type: "Dégradation",
          description: "Couvercle cassé",
          status: "RÉSOLU",
          date: "05 Mars 2026"
        }
      ]
    }
  },

  methods: {

    statusClass(status) {
      return {
        badge: true,
        pending: status === "EN ATTENTE",
        progress: status === "EN COURS",
        done: status === "RÉSOLU"
      }
    }

  }

}
</script>

<style scoped>
.report-card {
  background: white;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  transition: 0.2s;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

/* badges */
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.pending {
  background: #fef3c7;
  color: #92400e;
}

.progress {
  background: #dbeafe;
  color: #1e40af;
}

.done {
  background: #d1fae5;
  color: #065f46;
}
</style>
