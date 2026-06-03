<template>
  <div class="min-h-screen bg-slate-100 text-slate-700">

    <AppHeader />

    <main class="max-w-7xl mx-auto px-6 py-8">

      <!-- HEADER -->
      <div class="flex justify-between items-start mb-8">

        <div>
          <h2 class="page-title">
            <i class="bi bi-map"></i>
            Mes tournées
          </h2>

          <p class="page-subtitle">
            Consultez vos tournées, vos arrêts et les conteneurs à traiter.
          </p>
        </div>

      </div>

      <!-- KPI -->
      <section class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div class="stats-card">
          <span class="stats-label">
            Tournées attribuées
          </span>

          <strong>
            {{ tours.length }}
          </strong>
        </div>

        <div class="stats-card">
          <span class="stats-label">
            Conteneurs à traiter
          </span>

          <strong>
            {{ totalContainers }}
          </strong>
        </div>

        <div class="stats-card">
          <span class="stats-label">
            Temps estimé
          </span>

          <strong>
            {{ totalDuration }}
          </strong>
        </div>

        <div class="stats-card">
          <span class="stats-label">
            Disponibilité
          </span>

          <strong class="text-emerald-600">
            Disponible
          </strong>
        </div>

      </section>

      <!-- LAYOUT -->
      <div class="grid grid-cols-12 gap-6">

        <!-- ========================= -->
        <!-- LISTE TOURNÉES -->
        <!-- ========================= -->

        <section class="card col-span-12 lg:col-span-4">

          <div class="flex items-center justify-between mb-5">

            <h3 class="card-title">
              <i class="ri-route-line"></i>
              Mes tournées
            </h3>

            <span class="badge badge-info">
              {{ tours.length }}
            </span>

          </div>

          <div class="space-y-4">

            <div
              v-for="tour in tours"
              :key="tour.id"
              class="tour-card"
              :class="{
                'tour-card-active':
                selected && selected.id === tour.id
              }"
              @click="selectTour(tour)"
            >

              <div class="flex justify-between items-start">

                <div>

                  <h4 class="tour-title">
                    {{ tour.name }}
                  </h4>

                  <p class="tour-meta">
                    <i class="ri-map-pin-line"></i>
                    {{ tour.sector }}
                  </p>

                </div>

                <span
                  class="badge"
                  :class="getStatusClass(tour.status)"
                >
                  {{ tour.status }}
                </span>

              </div>

              <div class="tour-footer">

                <span>
                  <i class="ri-road-map-line"></i>
                  {{ tour.stops.length }} arrêts
                </span>

                <span>
                  <i class="ri-delete-bin-line"></i>
                  {{ tour.containers }} conteneurs
                </span>

              </div>

              <div class="mini-progress">

                <div
                  class="mini-progress-bar"
                  :style="{
                    width: tour.progress + '%'
                  }"
                />

              </div>

            </div>

          </div>

        </section>

        <!-- ========================= -->
        <!-- DETAIL TOURNEE -->
        <!-- ========================= -->

        <section class="card col-span-12 lg:col-span-8">

          <div v-if="!selected" class="empty-state">

            <i class="ri-route-line"></i>

            <p>
              Sélectionnez une tournée pour afficher son détail.
            </p>

          </div>

          <div v-else>

            <!-- HEADER DETAIL -->

            <div class="details-header">

              <div>

                <h3 class="selected-tour-title">
                  <i class="bi bi-truck"></i>
                  {{ selected.name }}
                </h3>

                <p class="selected-tour-meta">
                  {{ selected.sector }}
                </p>

              </div>

              <span
                class="badge"
                :class="getStatusClass(selected.status)"
              >
                {{ selected.status }}
              </span>

            </div>

            <!-- KPI TOURNEE -->

            <div class="tour-overview">

              <div class="overview-item">
                <span>Arrêts</span>
                <strong>
                  {{ selected.stops.length }}
                </strong>
              </div>

              <div class="overview-item">
                <span>Conteneurs</span>
                <strong>
                  {{ selected.containers }}
                </strong>
              </div>

              <div class="overview-item">
                <span>Durée</span>
                <strong>
                  {{ formatDuration(selected.duration) }}
                </strong>
              </div>

              <div class="overview-item">
                <span>Progression</span>
                <strong>
                  {{ selected.progress }}%
                </strong>
              </div>

            </div>

            <!-- PROCHAIN ARRET -->

            <div class="next-stop-card">

              <div class="next-stop-label">
                Prochain arrêt
              </div>

              <h4>
                {{ selected.stops[0]?.address }}
              </h4>

              <p>
                Arrivée prévue :
                {{ selected.stops[0]?.eta }}
              </p>

            </div>

            <!-- PROGRESSION -->

            <div class="summary-progress mt-6">

              <div class="progress">

                <div
                  class="progress-bar"
                  :style="{
                    width: selected.progress + '%'
                  }"
                />

              </div>

              <p>
                {{ selected.progress }}% de la tournée réalisée
              </p>

            </div>

            <!-- TIMELINE -->

            <div class="timeline mt-8">

              <div
                v-for="stop in selected.stops"
                :key="stop.order"
                class="timeline-item"
              >

                <div class="timeline-marker">
                  {{ stop.order }}
                </div>

                <div class="timeline-content">

                  <div class="stop-card">

                    <div
                      class="flex justify-between items-start"
                    >

                      <div>

                        <h4 class="font-semibold">
                          {{ stop.address }}
                        </h4>

                        <p class="text-sm text-slate-500">
                          Arrivée prévue :
                          {{ stop.eta }}
                        </p>

                      </div>

                      <span class="badge badge-info">
                        {{ stop.containers.length }}
                        conteneur(s)
                      </span>

                    </div>

                    <!-- CONTAINERS -->

                    <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4"
                    >

                      <div
                        v-for="container in stop.containers"
                        :key="container.id"
                        class="container-chip"
                      >

                        <div
                          class="flex items-center gap-3"
                        >

                          <div
                            class="container-avatar"
                          >
                            {{ container.type[0] }}
                          </div>

                          <div class="flex-1">

                            <div class="font-medium">
                              {{ container.id }}
                            </div>

                            <div
                              class="text-xs text-slate-500"
                            >
                              {{ container.type }}
                            </div>

                            <div
                              class="container-progress"
                            >

                              <div
                                class="container-progress-bar"
                                :style="{
                                  width:
                                  container.fill + '%'
                                }"
                              />

                            </div>

                            <div
                              class="text-xs mt-1"
                            >
                              {{ container.fill }}%
                            </div>

                          </div>

                        </div>

                      </div>

                    </div>

                    <!-- SIGNALEMENTS -->

                    <div
                      v-if="stop.reports?.length"
                      class="reports-card"
                    >

                      <h5>
                        Signalements citoyens
                      </h5>

                      <div
                        v-for="report in stop.reports"
                        :key="report.id"
                        class="report-item"
                      >

                        <i
                          class="ri-alarm-warning-line"
                        ></i>

                        <div>

                          <strong>
                            {{ report.type }}
                          </strong>

                          <p>
                            {{ report.date }}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <!-- ACTIONS -->

            <div class="sticky-actions">

              <button class="btn-primary">
                Démarrer la tournée
              </button>

              <button class="btn-secondary">
                Voir l'itinéraire GPS
              </button>

              <button class="btn-danger">
                Signaler un problème
              </button>

            </div>

          </div>

        </section>

      </div>

    </main>

  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader/AppHeader.vue"

export default {

  name: "AgentToursPage",

  components: {
    AppHeader
  },

  data() {
    return {

      selected: null,

      tours: [

        {
          id: 101,
          name: "Tournée Nord 101",
          sector: "Nord",

          duration: 95,
          containers: 5,

          assignedAt: "08:00",

          status: "À démarrer",
          progress: 0,

          stops: [

            {
              order: 1,
              address: "Rue des Fleurs 12",
              eta: "08:15",

              containers: [
                {
                  id: "C-201",
                  type: "Ordures",
                  fill: 78
                },
                {
                  id: "C-202",
                  type: "Tri",
                  fill: 40
                }
              ],

              reports: [
                {
                  id: 1,
                  type: "Mauvaise odeur",
                  date: "Il y a 2h"
                }
              ]
            },

            {
              order: 2,
              address: "Place du Marché",
              eta: "08:40",

              containers: [
                {
                  id: "C-203",
                  type: "Ordures",
                  fill: 92
                }
              ],

              reports: []
            },

            {
              order: 3,
              address: "Avenue des Pins 5",
              eta: "09:20",

              containers: [
                {
                  id: "C-204",
                  type: "Tri",
                  fill: 55
                },
                {
                  id: "C-205",
                  type: "Compost",
                  fill: 10
                }
              ],

              reports: [
                {
                  id: 2,
                  type: "Conteneur détérioré",
                  date: "Hier"
                }
              ]
            }

          ]
        },

        {
          id: 102,
          name: "Tournée Sud 102",
          sector: "Sud",

          duration: 110,
          containers: 7,

          assignedAt: "10:30",

          status: "Terminée",
          progress: 100,

          stops: [

            {
              order: 1,
              address: "Boulevard du Parc 3",
              eta: "10:45",

              containers: [
                {
                  id: "C-301",
                  type: "Ordures",
                  fill: 60
                }
              ],

              reports: []
            },

            {
              order: 2,
              address: "Impasse du Moulin",
              eta: "11:15",

              containers: [
                {
                  id: "C-302",
                  type: "Tri",
                  fill: 48
                },
                {
                  id: "C-303",
                  type: "Compost",
                  fill: 25
                }
              ],

              reports: []
            }

          ]
        }

      ]

    }
  },

  computed: {

    totalContainers() {

      return this.tours.reduce(
        (sum, tour) => sum + tour.containers,
        0
      )

    },

    totalDuration() {

      const total = this.tours.reduce(
        (sum, tour) => sum + tour.duration,
        0
      )

      const h = Math.floor(total / 60)
      const m = total % 60

      return h > 0
        ? `${h}h ${m}m`
        : `${m}m`

    },

    activeTours() {

      return this.tours.filter(
        t => t.status !== "Terminée"
      )

    },

    completedTours() {

      return this.tours.filter(
        t => t.status === "Terminée"
      )

    },

    nextStop() {

      if (!this.selected) return null

      return this.selected.stops?.[0] || null

    }

  },

  mounted() {

    if (this.tours.length) {
      this.selected = this.tours[0]
    }

  },

  methods: {

    selectTour(tour) {

      this.selected = tour

    },

    formatDuration(minutes) {

      if (!minutes && minutes !== 0) {
        return "-"
      }

      const h = Math.floor(minutes / 60)
      const m = minutes % 60

      return h > 0
        ? `${h}h ${m}m`
        : `${m}m`

    },

    getStatusClass(status) {

      switch (status) {

        case "Terminée":
          return "badge-success"

        case "En cours":
          return "badge-info"

        case "À démarrer":
        default:
          return "badge-warning"

      }

    },

    getFillColor(fill) {

      if (fill >= 90) {
        return "#ef4444"
      }

      if (fill >= 70) {
        return "#f59e0b"
      }

      return "#10b981"

    },

    startTour() {

      if (!this.selected) return

      this.selected.status = "En cours"

      if (!this.selected.progress) {
        this.selected.progress = 5
      }

    },

    finishTour() {

      if (!this.selected) return

      this.selected.status = "Terminée"
      this.selected.progress = 100

    },

    reportIssue() {

      if (!this.selected) return

      alert(
        `Signalement créé pour ${this.selected.name}`
      )

    },

    openGPS() {

      if (!this.selected) return

      alert(
        `Ouverture de l'itinéraire GPS de ${this.selected.name}`
      )

    }

  }

}
</script>

<style scoped>

/* =========================
   PAGE
========================= */

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
}

.page-subtitle {
  margin-top: 8px;
  color: #64748b;
  font-size: 0.95rem;
}

/* =========================
   CARD BASE
========================= */

.card {
  background: white;
  border-radius: 24px;
  padding: 24px;

  border: 1px solid rgba(148, 163, 184, 0.18);

  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.04);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}

/* =========================
   KPI
========================= */

.stats-card {
  background: white;
  border-radius: 20px;
  padding: 20px;

  border: 1px solid rgba(148, 163, 184, 0.18);

  box-shadow:
    0 10px 25px rgba(15, 23, 42, 0.04);

  display: flex;
  flex-direction: column;
}

.stats-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 8px;
}

.stats-card strong {
  font-size: 1.7rem;
  color: #0f172a;
}

/* =========================
   TOUR LIST
========================= */

.tour-card {
  background: #f8fafc;

  border: 1px solid #e2e8f0;
  border-radius: 18px;

  padding: 18px;

  cursor: pointer;

  transition: all 0.25s ease;
}

.tour-card:hover {
  transform: translateY(-2px);

  border-color: #a7f3d0;

  box-shadow:
    0 12px 30px rgba(15, 23, 42, 0.06);
}

.tour-card-active {
  background: #ecfdf5;

  border-color: #10b981;

  box-shadow:
    0 0 0 4px rgba(16, 185, 129, 0.08);
}

.tour-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.tour-meta {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.85rem;
}

.tour-footer {
  display: flex;
  justify-content: space-between;

  margin-top: 14px;

  color: #64748b;
  font-size: 0.85rem;
}

/* =========================
   MINI PROGRESS
========================= */

.mini-progress {
  height: 6px;

  margin-top: 14px;

  background: #e2e8f0;
  border-radius: 999px;

  overflow: hidden;
}

.mini-progress-bar {
  height: 100%;

  background: linear-gradient(
    90deg,
    #10b981,
    #34d399
  );

  border-radius: 999px;

  transition: width 0.3s ease;
}

/* =========================
   BADGES
========================= */

.badge {
  padding: 6px 12px;

  border-radius: 999px;

  font-size: 0.75rem;
  font-weight: 700;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.badge-warning {
  background: #ffedd5;
  color: #9a3412;
}

.badge-info {
  background: #dbeafe;
  color: #1d4ed8;
}

/* =========================
   DETAIL HEADER
========================= */

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 24px;
}

.selected-tour-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}

.selected-tour-meta {
  margin-top: 6px;
  color: #64748b;
}

/* =========================
   OVERVIEW
========================= */

.tour-overview {
  display: grid;

  grid-template-columns:
    repeat(auto-fit, minmax(140px, 1fr));

  gap: 16px;

  margin-bottom: 24px;
}

.overview-item {
  background: #f8fafc;

  border: 1px solid #e2e8f0;

  border-radius: 16px;

  padding: 16px;
}

.overview-item span {
  display: block;

  color: #64748b;
  font-size: 0.8rem;
}

.overview-item strong {
  display: block;

  margin-top: 4px;

  font-size: 1.3rem;
  color: #0f172a;
}

/* =========================
   NEXT STOP
========================= */

.next-stop-card {
  margin-bottom: 24px;

  padding: 20px;

  border-radius: 18px;

  background:
    linear-gradient(
      135deg,
      #ecfdf5,
      #d1fae5
    );

  border: 1px solid #a7f3d0;
}

.next-stop-label {
  font-size: 0.8rem;
  font-weight: 600;

  text-transform: uppercase;

  letter-spacing: .5px;

  color: #047857;

  margin-bottom: 6px;
}

.next-stop-card h4 {
  font-size: 1.15rem;
  font-weight: 700;

  color: #065f46;
}

.next-stop-card p {
  margin-top: 4px;
  color: #047857;
}

/* =========================
   PROGRESS
========================= */

.summary-progress {
  margin-bottom: 28px;
}

.progress {
  height: 10px;

  background: #e2e8f0;

  border-radius: 999px;

  overflow: hidden;
}

.progress-bar {
  height: 100%;

  background:
    linear-gradient(
      90deg,
      #10b981,
      #34d399
    );

  transition: width 0.3s ease;
}

.summary-progress p {
  margin-top: 10px;

  font-size: 0.85rem;

  color: #64748b;
}

/* =========================
   TIMELINE
========================= */

.timeline {
  position: relative;
}

.timeline::before {
  content: "";

  position: absolute;

  top: 0;
  left: 16px;
  bottom: 0;

  width: 2px;

  background: #cbd5e1;
}

.timeline-item {
  position: relative;

  padding-left: 55px;

  margin-bottom: 24px;
}

.timeline-marker {
  position: absolute;

  left: 0;
  top: 0;

  width: 34px;
  height: 34px;

  border-radius: 999px;

  background: #10b981;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 700;

  z-index: 2;
}

.timeline-content {
  width: 100%;
}

/* =========================
   STOP CARD
========================= */

.stop-card {
  background: white;

  border-radius: 18px;

  padding: 18px;

  border: 1px solid #e2e8f0;

  transition: 0.2s;
}

.stop-card:hover {
  box-shadow:
    0 12px 25px rgba(15, 23, 42, 0.05);
}

/* =========================
   CONTAINER CHIP
========================= */

.container-chip {
  background: #f8fafc;

  border-radius: 14px;

  border: 1px solid #e2e8f0;

  padding: 12px;
}

.container-avatar {
  width: 42px;
  height: 42px;

  border-radius: 12px;

  background: #10b981;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 700;
}

.container-progress {
  margin-top: 8px;

  height: 6px;

  border-radius: 999px;

  background: #e2e8f0;

  overflow: hidden;
}

.container-progress-bar {
  height: 100%;

  background:
    linear-gradient(
      90deg,
      #10b981,
      #34d399
    );

  border-radius: 999px;
}

/* =========================
   REPORTS
========================= */

.reports-card {
  margin-top: 18px;

  padding: 14px;

  border-radius: 14px;

  background: #fff7ed;

  border: 1px solid #fed7aa;
}

.reports-card h5 {
  font-size: 0.9rem;
  font-weight: 700;

  color: #9a3412;

  margin-bottom: 12px;
}

.report-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-bottom: 10px;
}

.report-item:last-child {
  margin-bottom: 0;
}

.report-item i {
  color: #ea580c;
  font-size: 1rem;
}

.report-item strong {
  display: block;
  color: #7c2d12;
}

.report-item p {
  font-size: 0.8rem;
  color: #9a3412;
}

/* =========================
   ACTION BAR
========================= */

.sticky-actions {
  position: sticky;

  bottom: 0;

  margin-top: 28px;

  background: white;

  border-top: 1px solid #e2e8f0;

  padding-top: 18px;

  display: flex;
  gap: 12px;

  flex-wrap: wrap;
}

/* =========================
   BUTTONS
========================= */

.btn-primary,
.btn-secondary,
.btn-danger {
  border-radius: 14px;

  padding: 12px 18px;

  font-weight: 600;

  transition: 0.2s ease;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
}

.btn-secondary {
  background: white;

  border: 1px solid #cbd5e1;

  color: #334155;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* =========================
   EMPTY STATE
========================= */

.empty-state {
  text-align: center;
  padding: 60px 20px;

  color: #64748b;
}

.empty-state i {
  font-size: 3rem;

  display: block;

  margin-bottom: 16px;

  color: #94a3b8;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1024px) {

  .tour-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .sticky-actions {
    flex-direction: column;
  }

}

@media (max-width: 640px) {

  .tour-overview {
    grid-template-columns: 1fr;
  }

}

</style>
