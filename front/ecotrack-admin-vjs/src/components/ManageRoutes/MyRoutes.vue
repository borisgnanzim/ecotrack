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
          <span class="stats-label">Tournées attribuées</span>
          <strong>{{ tours.length }}</strong>
        </div>
        <div class="stats-card">
          <span class="stats-label">Conteneurs à traiter</span>
          <strong>{{ totalContainers }}</strong>
        </div>
        <div class="stats-card">
          <span class="stats-label">Temps estimé</span>
          <strong>{{ totalDuration }}</strong>
        </div>
        <div class="stats-card">
          <span class="stats-label">Distance totale</span>
          <strong>{{ totalDistance }} km</strong>
        </div>
      </section>

      <!-- LAYOUT -->
      <div class="grid grid-cols-12 gap-6">

        <!-- LISTE TOURNÉES -->
        <section class="card col-span-12 lg:col-span-4">
          <div class="flex items-center justify-between mb-5">
            <h3 class="card-title">
              <i class="ri-route-line"></i>
              Mes tournées
            </h3>
            <span class="badge badge-info">{{ tours.length }}</span>
          </div>

          <div v-if="loading" class="text-center text-slate-400 py-8">Chargement…</div>

          <div v-else-if="tours.length === 0" class="empty-state">
            <i class="ri-route-line"></i>
            <p>Aucune tournée assignée.</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="tour in tours"
              :key="tour.id"
              class="tour-card"
              :class="{ 'tour-card-active': selected && selected.id === tour.id }"
              @click="selectTour(tour)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="tour-title">Tournée du {{ formatDate(tour.date) }}</h4>
                  <p class="tour-meta">
                    <i class="ri-calendar-line"></i>
                    {{ formatDate(tour.date) }}
                  </p>
                </div>
                <span class="badge" :class="getStatusClass(tour.status)">
                  {{ statusLabel(tour.status) }}
                </span>
              </div>

              <div class="tour-footer">
                <span><i class="ri-road-map-line"></i> {{ tour.steps.length }} arrêts</span>
                <span><i class="ri-delete-bin-line"></i> {{ tour.steps.length }} conteneurs</span>
              </div>

              <div class="mini-progress">
                <div class="mini-progress-bar" :style="{ width: progressPct(tour) + '%' }" />
              </div>
            </div>
          </div>
        </section>

        <!-- DETAIL TOURNEE -->
        <section class="card col-span-12 lg:col-span-8">

          <div v-if="!selected" class="empty-state">
            <i class="ri-route-line"></i>
            <p>Sélectionnez une tournée pour afficher son détail.</p>
          </div>

          <div v-else>

            <!-- HEADER DETAIL -->
            <div class="details-header">
              <div>
                <h3 class="selected-tour-title">
                  <i class="bi bi-truck"></i>
                  Tournée du {{ formatDate(selected.date) }}
                </h3>
                <p class="selected-tour-meta">{{ selected.steps.length }} arrêt(s)</p>
              </div>
              <span class="badge" :class="getStatusClass(selected.status)">
                {{ statusLabel(selected.status) }}
              </span>
            </div>

            <!-- KPI TOURNEE -->
            <div class="tour-overview">
              <div class="overview-item">
                <span>Arrêts</span>
                <strong>{{ selected.steps.length }}</strong>
              </div>
              <div class="overview-item">
                <span>Durée estimée</span>
                <strong>{{ formatDuration(selected.estimatedTime) }}</strong>
              </div>
              <div class="overview-item">
                <span>Distance</span>
                <strong>{{ selected.totalDistance ?? '—' }} km</strong>
              </div>
              <div class="overview-item">
                <span>Remplissage moy.</span>
                <strong>{{ avgFill(selected) }}%</strong>
              </div>
            </div>

            <!-- PROCHAIN ARRET -->
            <div v-if="selected.steps.length" class="next-stop-card">
              <div class="next-stop-label">Prochain arrêt</div>
              <h4>{{ selected.steps[0].container?.address || 'Conteneur ' + selected.steps[0].container?.code }}</h4>
              <p>
                Conteneur :
                <strong>{{ selected.steps[0].container?.code }}</strong>
                — {{ selected.steps[0].container?.type }}
                — {{ selected.steps[0].container?.fillLevel ?? '?' }}% plein
              </p>
            </div>

            <!-- PROGRESSION -->
            <div class="summary-progress mt-6">
              <div class="progress">
                <div class="progress-bar" :style="{ width: progressPct(selected) + '%' }" />
              </div>
              <p>{{ progressPct(selected) }}% de la tournée réalisée</p>
            </div>

            <!-- TIMELINE des étapes -->
            <div class="timeline mt-8">
              <div v-for="step in selected.steps" :key="step.id" class="timeline-item">
                <div class="timeline-marker">{{ step.order }}</div>
                <div class="timeline-content">
                  <div class="stop-card">
                    <div class="flex justify-between items-start">
                      <div>
                        <h4 class="font-semibold">
                          {{ step.container?.address || 'Conteneur ' + step.container?.code }}
                        </h4>
                        <p class="text-sm text-slate-500">
                          Code : {{ step.container?.code }} — {{ step.container?.type }}
                        </p>
                      </div>
                      <span class="badge" :class="fillBadge(step.container?.fillLevel)">
                        {{ step.container?.fillLevel ?? '?' }}%
                      </span>
                    </div>

                    <!-- Barre remplissage -->
                    <div class="container-progress mt-3">
                      <div
                        class="container-progress-bar"
                        :style="{ width: (step.container?.fillLevel ?? 0) + '%', background: fillColor(step.container?.fillLevel) }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="sticky-actions">
              <button
                v-if="selected.status === 'planned'"
                class="btn-primary"
                @click="changeStatus(selected, 'in_progress')"
              >
                Démarrer la tournée
              </button>
              <button
                v-if="selected.status === 'in_progress'"
                class="btn-primary"
                @click="changeStatus(selected, 'completed')"
              >
                Terminer la tournée
              </button>
              <button
                v-if="['planned','in_progress'].includes(selected.status)"
                class="btn-danger"
                @click="changeStatus(selected, 'cancelled')"
              >
                Annuler
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
import routeService from "@/services/routes/routeService.js"
import authStorage from "@/services/authStorage.js"
import { useToast } from "vue-toastification"

export default {
  name: "MyRoutes",
  components: { AppHeader },

  data() {
    return {
      toast: useToast(),
      tours:    [],
      selected: null,
      loading:  true,
    }
  },

  async mounted() {
    await this.fetchMyRoutes()
    if (this.tours.length) this.selected = this.tours[0]
  },

  computed: {
    totalContainers() {
      return this.tours.reduce((sum, t) => sum + t.steps.length, 0)
    },
    totalDuration() {
      const total = this.tours.reduce((sum, t) => sum + (t.estimatedTime ?? 0), 0)
      if (!total) return '—'
      const h = Math.floor(total / 60)
      const m = total % 60
      return h > 0 ? `${h}h ${m}m` : `${m}m`
    },
    totalDistance() {
      const total = this.tours.reduce((sum, t) => sum + (t.totalDistance ?? 0), 0)
      return total ? total.toFixed(1) : '—'
    },
  },

  methods: {
    async fetchMyRoutes() {
      this.loading = true
      try {
        const agentId = authStorage.getUserUuid()
        if (!agentId) { this.loading = false; return }
        const res = await routeService.getByAgent(agentId)
        this.tours = res.data
        if (this.selected) {
          this.selected = this.tours.find(t => t.id === this.selected.id) ?? this.tours[0] ?? null
        }
      } catch {
        this.toast.error('Erreur lors du chargement de vos tournées.')
      } finally {
        this.loading = false
      }
    },

    selectTour(tour) {
      this.selected = tour
    },

    async changeStatus(tour, status) {
      const labels = { in_progress: 'démarrée', completed: 'terminée', cancelled: 'annulée' }
      try {
        await routeService.update(tour.id, { status })
        this.toast.success(`Tournée ${labels[status] ?? status}.`)
        await this.fetchMyRoutes()
      } catch (err) {
        this.toast.error(err.response?.data?.error || 'Impossible de changer le statut.')
      }
    },

    // ── Helpers ────────────────────────────────────────────────────────────

    progressPct(tour) {
      if (tour.status === 'completed') return 100
      if (tour.status === 'cancelled') return 0
      if (tour.status === 'in_progress') return 50
      return 0
    },

    avgFill(tour) {
      const vals = tour.steps.map(s => s.container?.fillLevel).filter(v => v != null)
      if (!vals.length) return 0
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    },

    formatDate(iso) {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },

    formatDuration(minutes) {
      if (!minutes) return '—'
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return h > 0 ? `${h}h ${m}m` : `${m}m`
    },

    getStatusClass(s) {
      return { planned: 'badge-warning', in_progress: 'badge-info', completed: 'badge-success', cancelled: 'badge-cancelled' }[s] ?? 'badge-warning'
    },

    statusLabel(s) {
      return { planned: 'À démarrer', in_progress: 'En cours', completed: 'Terminée', cancelled: 'Annulée' }[s] ?? s
    },

    fillBadge(v) {
      if (v == null) return 'badge-info'
      if (v >= 90) return 'badge-danger'
      if (v >= 70) return 'badge-warning'
      return 'badge-success'
    },

    fillColor(v) {
      if (v == null) return '#10b981'
      if (v >= 90) return '#ef4444'
      if (v >= 70) return '#f59e0b'
      return '#10b981'
    },
  },
}
</script>

<style scoped>
.page-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 1.8rem; font-weight: 700; color: #0f172a;
}
.page-subtitle { margin-top: 8px; color: #64748b; font-size: .95rem; }

.card {
  background: white; border-radius: 24px; padding: 24px;
  border: 1px solid rgba(148,163,184,.18);
  box-shadow: 0 10px 30px rgba(15,23,42,.04);
}
.card-title { display: flex; align-items: center; gap: 10px; font-size: 1.05rem; font-weight: 700; color: #0f172a; }

.stats-card {
  background: white; border-radius: 20px; padding: 20px;
  border: 1px solid rgba(148,163,184,.18);
  box-shadow: 0 10px 25px rgba(15,23,42,.04);
  display: flex; flex-direction: column;
}
.stats-label { font-size: .85rem; color: #64748b; margin-bottom: 8px; }
.stats-card strong { font-size: 1.7rem; color: #0f172a; }

.tour-card {
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 18px; padding: 18px; cursor: pointer; transition: all .25s;
}
.tour-card:hover { transform: translateY(-2px); border-color: #a7f3d0; box-shadow: 0 12px 30px rgba(15,23,42,.06); }
.tour-card-active { background: #ecfdf5; border-color: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,.08); }
.tour-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
.tour-meta { margin-top: 6px; color: #64748b; font-size: .85rem; }
.tour-footer { display: flex; justify-content: space-between; margin-top: 14px; color: #64748b; font-size: .85rem; }

.mini-progress { height: 6px; margin-top: 14px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.mini-progress-bar { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 999px; transition: width .3s; }

.badge { padding: 6px 12px; border-radius: 999px; font-size: .75rem; font-weight: 700; }
.badge-success   { background: #dcfce7; color: #166534; }
.badge-warning   { background: #ffedd5; color: #9a3412; }
.badge-info      { background: #dbeafe; color: #1d4ed8; }
.badge-danger    { background: #fee2e2; color: #991b1b; }
.badge-cancelled { background: #f1f5f9; color: #64748b; }

.details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.selected-tour-title { font-size: 1.4rem; font-weight: 700; color: #0f172a; }
.selected-tour-meta { margin-top: 6px; color: #64748b; }

.tour-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); gap: 16px; margin-bottom: 24px; }
.overview-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; }
.overview-item span { display: block; color: #64748b; font-size: .8rem; }
.overview-item strong { display: block; margin-top: 4px; font-size: 1.3rem; color: #0f172a; }

.next-stop-card {
  margin-bottom: 24px; padding: 20px; border-radius: 18px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #a7f3d0;
}
.next-stop-label { font-size: .8rem; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: #047857; margin-bottom: 6px; }
.next-stop-card h4 { font-size: 1.1rem; font-weight: 700; color: #065f46; }
.next-stop-card p { margin-top: 4px; color: #047857; font-size: .9rem; }

.summary-progress { margin-bottom: 28px; }
.progress { height: 10px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.progress-bar { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); transition: width .3s; }
.summary-progress p { margin-top: 10px; font-size: .85rem; color: #64748b; }

.timeline { position: relative; }
.timeline::before { content: ""; position: absolute; top: 0; left: 16px; bottom: 0; width: 2px; background: #cbd5e1; }
.timeline-item { position: relative; padding-left: 55px; margin-bottom: 24px; }
.timeline-marker {
  position: absolute; left: 0; top: 0;
  width: 34px; height: 34px; border-radius: 999px;
  background: #10b981; color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; z-index: 2;
}
.stop-card { background: white; border-radius: 18px; padding: 18px; border: 1px solid #e2e8f0; transition: .2s; }
.stop-card:hover { box-shadow: 0 12px 25px rgba(15,23,42,.05); }

.container-progress { height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.container-progress-bar { height: 100%; border-radius: 999px; transition: width .3s; }

.sticky-actions {
  position: sticky; bottom: 0; margin-top: 28px;
  background: white; border-top: 1px solid #e2e8f0;
  padding-top: 18px; display: flex; gap: 12px; flex-wrap: wrap;
}

.btn-primary, .btn-danger {
  border-radius: 14px; padding: 12px 18px; font-weight: 600; transition: .2s;
}
.btn-primary { background: #10b981; color: white; }
.btn-primary:hover { background: #059669; }
.btn-danger  { background: #ef4444; color: white; }
.btn-danger:hover { background: #dc2626; }

.empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 16px; color: #94a3b8; }

@media (max-width: 1024px) {
  .tour-overview { grid-template-columns: repeat(2,1fr); }
  .sticky-actions { flex-direction: column; }
}
</style>
