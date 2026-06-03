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

              <div class="tour-load">
                <div
                  class="tour-load-bar"
                  :style="{ width: (t.fillRate || 75) + '%' }"
                />
              </div>

              <div class="tour-footer">

                <span class="meta">
                  <i class="bi bi-box-seam"></i>
                  {{ t.containers }} conteneurs
                </span>

                <button
                  class="btn-mini"
                  @click="openAssignModal(t)"
                >
                  <i class="ri-user-add-line"></i>
                  Assigner agent
                </button>

              </div>

              <div class="tour-stats">

                <span>
                  <i class="ri-road-map-line"></i>
                  {{ t.distance || 12 }} km
                </span>

                <span>
                  <i class="ri-delete-bin-line"></i>
                  {{ t.containers }} conteneurs
                </span>

                <span>
                  <i class="ri-user-line"></i>
                  {{ t.agent || "Non assigné" }}
                </span>

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

    <transition name="fade">

      <div
        v-if="showAssignModal"
        class="modal-overlay"
      >

        <div class="assign-modal">

          <div class="modal-header">

            <div>

              <h3>
                Affectation tournée
              </h3>

              <p>
                {{ selectedTour?.name }}
              </p>

            </div>

            <button
              @click="showAssignModal = false"
              class="close-btn"
            >
              <i class="ri-close-line"></i>
            </button>

          </div>

          <div class="modal-content">

            <div class="form-group">

              <label>Agent</label>

              <select
                v-model="assignForm.agentId"
                class="input-modern"
              >
                <option :value="null">
                  Sélectionner un agent
                </option>

                <option
                  v-for="agent in availableAgents"
                  :key="agent.id"
                  :value="agent.id"
                >
                  {{ agent.name }}
                </option>

              </select>

            </div>

            <div class="form-group">

              <label>Véhicule</label>

              <select
                v-model="assignForm.vehicle"
                class="input-modern"
              >
                <option value="">
                  Choisir un véhicule
                </option>

                <option
                  v-for="v in vehicles"
                  :key="v.id"
                  :value="v.id"
                >
                  {{ v.name }} - {{ v.plate }}
                </option>

              </select>

            </div>

            <div class="form-group">

              <label>Heure de départ</label>

              <input
                v-model="assignForm.startTime"
                type="time"
                class="input-modern"
              />

            </div>

            <div class="form-group">

              <label>Consignes</label>

              <textarea
                v-model="assignForm.notes"
                rows="4"
                class="input-modern"
                placeholder="Informations complémentaires..."
              />

            </div>

          </div>

          <div class="modal-actions">

            <button
              class="btn-ghost"
              @click="showAssignModal = false"
            >
              Annuler
            </button>

            <button
              class="btn-primary"
              @click="assignAgent"
            >
              Confirmer l'affectation
            </button>

          </div>

        </div>

      </div>

    </transition>
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
          priority: "URGENT",

          distance: 14,
          fillRate: 92,
          agent: null
        },
        {
          id: 2,
          name: "Tournée B",
          sector: "Nord",
          duration: 90,
          containers: 4,
          priority: "NORMAL",

          distance: 9,
          fillRate: 75,
          agent: "Ahmed K."
        }
      ],

      agents: [
        { id: 1, name: "Ahmed K.", initials: "AK", status: "Disponible", load: 20 },
        { id: 2, name: "Sophie M.", initials: "SM", status: "En tournée", load: 80 },
        { id: 3, name: "Lucas P.", initials: "LP", status: "Disponible", load: 35 }
      ],

      showAssignModal: false,
      selectedTour: null,

      assignForm: {
        agentId: null,
        vehicle: "",
        startTime: "",
        notes: ""
      },

      vehicles: [
        {
          id: 1,
          name: "Camion 01",
          plate: "AB-123-CD",
          status: "Disponible"
        },
        {
          id: 2,
          name: "Camion 02",
          plate: "EF-456-GH",
          status: "Disponible"
        }
      ]
    }
  },

  computed: {

    availableAgents() {
      return this.agents.filter(
        a => a.status === "Disponible"
      )
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
    },

    openAssignModal(tour) {

      this.selectedTour = tour

      this.assignForm = {
        agentId: null,
        vehicle: "",
        startTime: "",
        notes: ""
      }

      this.showAssignModal = true
    },

    assignAgent() {

      const agent = this.agents.find(
        a => a.id === this.assignForm.agentId
      )

      if (
        !agent ||
        !this.assignForm.vehicle ||
        !this.assignForm.startTime
      ) {
        return
      }

      this.selectedTour.agent = agent.name

      agent.status = "En tournée"
      agent.load += 20

      this.showAssignModal = false
    }
  }
}
</script>


<style scoped>
.min-h-screen {
  background: #f8fafc;
}

main {
  min-height: calc(100vh - 112px);
}

.card {
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.08);
}

.page-title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title i,
.card-title i {
  font-size: 1.2rem;
  color: #059669;
}

.page-subtitle {
  margin-top: 8px;
  font-size: 0.95rem;
  color: #64748b;
  max-width: 540px;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #0f172a;
}

.sector-card,
.tour-card,
.agent-card {
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  padding: 18px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sector-card:hover,
.tour-card:hover,
.agent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.1);
}

.meta,
.tour-meta {
  font-size: 0.92rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tour-meta {
  margin-top: 8px;
}

.dot {
  margin: 0 6px;
  color: #94a3b8;
}

.progress {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  margin: 12px 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #059669 0%, #10b981 100%);
  border-radius: 999px;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: #059669;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 12px 30px rgba(5, 150, 105, 0.18);
}

.btn-primary,
.btn-mini,
.btn-ghost {
  transition: all 0.2s ease;
}

.btn-primary {
  background: #059669;
  color: white;
  padding: 14px 20px;
  border-radius: 16px;
  display: inline-flex;
  gap: 10px;
  align-items: center;
  font-weight: 600;
  box-shadow: 0 18px 40px rgba(5, 150, 105, 0.18);
}

.btn-primary:hover {
  background: #047857;
  transform: translateY(-1px);
}

.btn-mini {
  font-size: 0.9rem;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 10px 14px;
  border-radius: 14px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #0f172a;
}

.btn-mini:hover {
  background: #f8fafc;
}

.btn-ghost {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #475569;
}

.btn-ghost:hover {
  background: white;
}

.badge {
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.01em;
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

.agent-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
  font-size: 0.95rem;
  color: #475569;
}

.agent-meta span:last-child {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tour-load {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  margin-top: 14px;
  overflow: hidden;
}

.tour-load-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    #059669,
    #10b981
  );
  border-radius: 999px;
}

.tour-stats {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 14px;
  font-size: 0.85rem;
  color: #64748b;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(5px);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 100;
}

.assign-modal {
  width: 100%;
  max-width: 650px;

  background: white;
  border-radius: 24px;

  overflow: hidden;

  box-shadow:
    0 40px 90px rgba(15,23,42,.15);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.input-modern {
  width: 100%;
  padding: 14px;

  border-radius: 14px;
  border: 1px solid #cbd5e1;

  background: #f8fafc;
}

.input-modern:focus {
  outline: none;
  border-color: #10b981;
  background: white;
}

.modal-actions {
  padding: 24px;
  border-top: 1px solid #e2e8f0;

  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.close-btn {
  width: 40px;
  height: 40px;

  border-radius: 12px;
  background: #f8fafc;
}

.close-btn:hover {
  background: #e2e8f0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
