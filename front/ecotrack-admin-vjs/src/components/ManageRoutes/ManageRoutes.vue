<template>
  <div class="min-h-screen bg-slate-100 text-slate-700">

    <AppHeader />

    <div class="max-w-6xl mx-auto px-6 mt-4">
      <BackButton />
    </div>

    <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">

      <!-- HEADER -->
      <div class="flex justify-between items-start">

        <div>
          <h2 class="page-title">
            <i class="bi bi-truck-front-fill"></i>
            Gestion des tournées
          </h2>

          <p class="page-subtitle">
            Planification intelligente des collectes et affectation des agents
          </p>
        </div>

        <button class="btn-primary">
          <i class="bi bi-plus-circle"></i>
          Générer une tournée
        </button>

      </div>

      <!-- GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- SECTEURS -->
        <section class="card">

          <h3 class="card-title">
            <i class="ri-map-pin-2-line"></i>
            Secteurs
          </h3>

          <div class="space-y-3">

            <div
              v-for="s in sectors"
              :key="s.name"
              class="sector-card"
            >

              <div class="flex justify-between items-center">

                <div class="flex items-center gap-2 font-medium">
                  <i class="ri-building-2-line text-emerald-600"></i>
                  {{ s.name }}
                </div>

                <span class="badge" :class="fillBadge(s.fill)">
                  {{ s.fill }}%
                </span>

              </div>

              <div class="progress">
                <div
                  class="progress-bar"
                  :style="{ width: s.fill + '%' }"
                />
              </div>

              <div class="meta">
                <i class="bi bi-trash3"></i>
                {{ s.containers }} conteneurs
              </div>

            </div>

          </div>

        </section>

        <!-- TOURNEES -->
        <section class="card lg:col-span-2">

          <h3 class="card-title">
            <i class="ri-route-line"></i>
            Tournées planifiées
          </h3>

          <div class="space-y-4">

            <div
              v-for="t in tours"
              :key="t.id"
              class="tour-card"
            >

              <div class="flex justify-between items-start">

                <div>

                  <h4 class="tour-title">
                    <i class="bi bi-truck"></i>
                    {{ t.name }}
                  </h4>

                  <p class="tour-meta">
                    <i class="ri-map-pin-line"></i>
                    {{ t.sector }}

                    <span class="dot">•</span>

                    <i class="ri-time-line"></i>
                    {{ t.duration }} min
                  </p>

                </div>

                <span class="badge" :class="priorityClass(t.priority)">
                  {{ t.priority }}
                </span>

              </div>

              <div class="tour-footer">

                <span class="meta">
                  <i class="bi bi-box-seam"></i>
                  {{ t.containers }} conteneurs
                </span>

                <button class="btn-mini">
                  <i class="ri-user-add-line"></i>
                  Assigner agent
                </button>

              </div>

            </div>

          </div>

        </section>

      </div>

      <!-- AGENTS -->
      <section class="card">

        <h3 class="card-title">
          <i class="ri-user-settings-line"></i>
          Agents disponibles
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div
            v-for="a in agents"
            :key="a.id"
            class="agent-card"
          >

            <div class="flex items-center gap-3">

              <div class="avatar">
                {{ a.initials }}
              </div>

              <div>
                <p class="font-semibold">
                  {{ a.name }}
                </p>

                <p class="text-xs text-slate-500">
                  {{ a.status }}
                </p>
              </div>

            </div>

            <div class="agent-meta">

              <span>
                <i class="bi bi-speedometer2"></i>
                {{ a.load }}%
              </span>

              <span :class="statusAgent(a.status)">
                <i class="bi bi-circle-fill"></i>
              </span>

            </div>

            <button class="btn-ghost w-full mt-3">
              Affecter à une tournée
            </button>

          </div>

        </div>

      </section>

    </main>

  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader/AppHeader.vue"
import BackButton from "@/components/BackButton.vue"
export default {
  components: { AppHeader, BackButton },

  data() {
    return {
      sectors: [
        { name: "Centre-ville", fill: 82, containers: 14 },
        { name: "Nord", fill: 45, containers: 9 },
        { name: "Sud", fill: 91, containers: 11 },
      ],

      tours: [
        {
          id: 1,
          name: "Tournée A",
          sector: "Centre-ville",
          duration: 120,
          containers: 6,
          priority: "URGENT"
        },
        {
          id: 2,
          name: "Tournée B",
          sector: "Nord",
          duration: 90,
          containers: 4,
          priority: "NORMAL"
        }
      ],

      agents: [
        { id: 1, name: "Ahmed K.", initials: "AK", status: "Disponible", load: 20 },
        { id: 2, name: "Sophie M.", initials: "SM", status: "En tournée", load: 80 },
        { id: 3, name: "Lucas P.", initials: "LP", status: "Disponible", load: 35 }
      ]
    }
  },

  methods: {
    fillBadge(v) {
      if (v > 80) return "badge-danger"
      if (v > 50) return "badge-warning"
      return "badge-success"
    },

    priorityClass(p) {
      return {
        URGENT: "badge-danger",
        NORMAL: "badge-info"
      }[p]
    },

    statusAgent(s) {
      return s === "Disponible"
        ? "text-emerald-600"
        : "text-red-500"
    }
  }
}
</script>


<style scoped>
.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* CARDS */
.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

/* SECTORS */
.sector-card,
.tour-card,
.agent-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  background: #f8fafc;
}

/* META */
.meta {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tour-meta {
  font-size: 12px;
  color: #64748b;
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 4px;
}

.dot {
  margin: 0 6px;
}

/* PROGRESS */
.progress {
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  margin: 8px 0;
}

.progress-bar {
  height: 100%;
  background: #059669;
  border-radius: 999px;
}

/* AVATAR */
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #059669;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* BUTTONS */
.btn-primary {
  background: #059669;
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  display: flex;
  gap: 6px;
  align-items: center;
  font-weight: 500;
}

.btn-mini {
  font-size: 12px;
  background: #e2e8f0;
  padding: 6px 10px;
  border-radius: 8px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-ghost {
  background: #f1f5f9;
  padding: 8px;
  border-radius: 10px;
}

/* BADGES */
.badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 600;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-warning {
  background: #ffedd5;
  color: #9a3412;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

/* AGENTS */
.agent-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
}
</style>
