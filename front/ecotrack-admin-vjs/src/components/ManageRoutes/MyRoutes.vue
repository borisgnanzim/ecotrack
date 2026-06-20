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
          <div class="flex items-center justify-between mb-4">
            <h3 class="card-title">
              <i class="ri-route-line"></i>
              Mes tournées
            </h3>
            <span v-if="urgentCount" class="badge badge-urgent">
              <i class="ri-alarm-warning-line"></i> {{ urgentCount }} urgent{{ urgentCount > 1 ? 's' : '' }}
            </span>
          </div>

          <!-- TABS -->
          <div class="tour-tabs mb-5">
            <button
              :class="['tab-btn', routeTab === 'upcoming' && 'tab-active']"
              @click="switchTab('upcoming')"
            >
              À venir
              <span class="tab-count">{{ upcomingTours.length }}</span>
            </button>
            <button
              :class="['tab-btn', routeTab === 'history' && 'tab-active']"
              @click="switchTab('history')"
            >
              Historique
              <span class="tab-count">{{ historyTours.length }}</span>
            </button>
          </div>

          <div v-if="loading" class="text-center text-slate-400 py-8">Chargement…</div>

          <div v-else-if="displayedTours.length === 0" class="empty-state">
            <i class="ri-route-line"></i>
            <p>Aucune tournée {{ routeTab === 'upcoming' ? 'à venir' : "dans l'historique" }}.</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="tour in displayedTours"
              :key="tour.id"
              class="tour-card"
              :class="{
                'tour-card-active': selected && selected.id === tour.id,
                'tour-card-urgent': isUrgent(tour),
              }"
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
                <div class="flex flex-col items-end gap-1">
                  <span v-if="isUrgent(tour)" class="badge badge-urgent">
                    <i class="ri-alarm-warning-line"></i> Urgent
                  </span>
                  <span class="badge" :class="getStatusClass(tour.status)">
                    {{ statusLabel(tour.status) }}
                  </span>
                </div>
              </div>

              <div class="tour-footer">
                <span><i class="ri-road-map-line"></i> {{ tour.steps.length }} arrêts</span>
                <span><i class="ri-delete-bin-line"></i> {{ tour.steps.length }} conteneurs</span>
              </div>

              <div class="mini-progress">
                <div
                  class="mini-progress-bar"
                  :class="{ 'mini-progress-urgent': isUrgent(tour) }"
                  :style="{ width: progressPct(tour) + '%' }"
                />
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
                  <span
                    v-if="isUrgent(selected)"
                    class="badge badge-urgent"
                    style="font-size:.7rem;vertical-align:middle;"
                  >
                    <i class="ri-alarm-warning-line"></i> Urgent
                  </span>
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

            <!-- PROCHAIN ARRET (premier arrêt trié) -->
            <div v-if="nextStop(selected)" class="next-stop-card">
              <div class="next-stop-label">Prochain arrêt</div>
              <h4>{{ nextStop(selected).container?.address || 'Conteneur ' + nextStop(selected).container?.code }}</h4>
              <p>
                Conteneur :
                <strong>{{ nextStop(selected).container?.code }}</strong>
                — {{ nextStop(selected).container?.type }}
                — {{ nextStop(selected).container?.fillLevel ?? '?' }}% plein
              </p>
            </div>

            <!-- PROGRESSION -->
            <div class="summary-progress mt-6">
              <div class="progress">
                <div class="progress-bar" :style="{ width: progressPct(selected) + '%' }" />
              </div>
              <p>{{ progressPct(selected) }}% de la tournée réalisée</p>
            </div>

            <!-- CARTE INTERACTIVE -->
            <div v-if="showMap" class="map-section mt-6">
              <div v-if="mapLoading" class="map-loading-overlay">
                <i class="ri-loader-4-line"></i> Chargement de la carte…
              </div>
              <div id="my-route-map" class="route-map"></div>
            </div>

            <!-- TIMELINE des étapes -->
            <div class="timeline mt-8">
              <div v-for="step in sortedSteps(selected)" :key="step.id" class="timeline-item">
                <div class="timeline-marker">{{ step.stepOrder ?? step.order }}</div>
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
              <button class="btn-secondary" :disabled="mapLoading" @click="toggleMap(selected)">
                <i :class="showMap ? 'ri-map-2-line' : 'ri-map-line'"></i>
                {{ showMap ? 'Masquer la carte' : 'Voir la carte' }}
              </button>
              <button class="btn-secondary" :disabled="exportingPDF" @click="exportPDF(selected)">
                <i class="ri-file-pdf-line"></i>
                {{ exportingPDF ? 'Génération…' : 'Exporter PDF' }}
              </button>
            </div>

          </div>

        </section>

      </div>

    </main>

  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import AppHeader from "@/components/AppHeader/AppHeader.vue"
import routeService from "@/services/routes/routeService.js"
import authStorage from "@/services/authStorage.js"
import { useToast } from "vue-toastification"

export default {
  name: "MyRoutes",
  components: { AppHeader },

  data() {
    return {
      toast:           useToast(),
      tours:           [],
      selected:        null,
      loading:         true,
      today:           new Date().setHours(0, 0, 0, 0),
      _todayInterval:  null,
      routeTab:        'upcoming',
      showMap:         false,
      mapLoading:      false,
      _mapInstance:    null,
      exportingPDF:    false,
      currentUserName: '',
    }
  },

  async mounted() {
    await this.fetchMyRoutes()

    try {
      const profile = await authStorage.getProfile()
      this.currentUserName = profile.data?.name || profile.name || ''
    } catch { /* profil non critique */ }

    this.selected = this.upcomingTours[0] ?? this.historyTours[0] ?? null

    this._todayInterval = setInterval(() => {
      this.today = new Date().setHours(0, 0, 0, 0)
    }, 60_000)
  },

  beforeUnmount() {
    clearInterval(this._todayInterval)
    this._destroyMap()
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

    upcomingTours() {
      return this.tours
        .filter(t => ['planned', 'in_progress'].includes(t.status))
        .sort((a, b) => {
          const ua = this.isUrgent(a) ? 0 : 1
          const ub = this.isUrgent(b) ? 0 : 1
          if (ua !== ub) return ua - ub
          return new Date(a.date) - new Date(b.date)
        })
    },

    historyTours() {
      return this.tours
        .filter(t => ['completed', 'cancelled'].includes(t.status))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    },

    displayedTours() {
      return this.routeTab === 'upcoming' ? this.upcomingTours : this.historyTours
    },

    urgentCount() {
      return this.tours.filter(t => this.isUrgent(t)).length
    },
  },

  methods: {
    // ── Data ───────────────────────────────────────────────────────────────

    async fetchMyRoutes() {
      this.loading = true
      try {
        const agentId = authStorage.getUserUuid()
        if (!agentId) { this.loading = false; return }
        const res = await routeService.getByAgent(agentId)
        this.tours = res.data
        if (this.selected) {
          this.selected = this.tours.find(t => t.id === this.selected.id) ?? null
        }
      } catch {
        this.toast.error('Erreur lors du chargement de vos tournées.')
      } finally {
        this.loading = false
      }
    },

    selectTour(tour) {
      if (this.selected?.id !== tour.id) {
        this._destroyMap()
        this.showMap = false
      }
      this.selected = tour
    },

    switchTab(tab) {
      this.routeTab = tab
      this._destroyMap()
      this.showMap = false
      const list = tab === 'upcoming' ? this.upcomingTours : this.historyTours
      this.selected = list[0] ?? null
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

    // ── Carte ──────────────────────────────────────────────────────────────

    async toggleMap(tour) {
      if (this.showMap) {
        this.showMap = false
        this._destroyMap()
        return
      }
      this.showMap = true
      this.mapLoading = true
      try {
        const { data } = await routeService.getMap(tour.id)
        // div est dans le DOM (v-if=true), on attend le rendu avant d'init
        await this.$nextTick()
        this._initMap(data)
      } catch {
        this.toast.error('Impossible de charger la carte.')
        this.showMap = false
      } finally {
        this.mapLoading = false
        // recalcule la taille après que l'overlay de chargement disparaît
        this.$nextTick(() => this._mapInstance?.invalidateSize())
      }
    },

    _initMap(mapData) {
      this._destroyMap()
      const el = document.getElementById('my-route-map')
      if (!el) return

      const map = L.map(el, { zoomControl: true })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Le backend renvoie du GeoJSON — [lng, lat] → Leaflet veut [lat, lng]
      const features = mapData.features ?? []
      const coords = []

      features
        .filter(f => f.geometry?.type === 'Point')
        .forEach((f) => {
          const [lng, lat] = f.geometry.coordinates
          const fill = f.properties.fillLevel ?? 0
          const color = fill >= 90 ? '#ef4444' : fill >= 70 ? '#f59e0b' : '#10b981'
          L.circleMarker([lat, lng], {
            radius: 10, color, fillColor: color, fillOpacity: 0.85, weight: 2,
          })
            .bindPopup(
              `<b>Arrêt ${f.properties.stepOrder ?? '?'}</b><br>` +
              `Zone : ${f.properties.zoneId ?? '—'}<br>` +
              `Remplissage : ${fill}%`
            )
            .addTo(map)
          coords.push([lat, lng])
        })

      const line = features.find(f => f.geometry?.type === 'LineString')
      if (line?.geometry.coordinates.length >= 2) {
        const linePts = line.geometry.coordinates.map(([lng, lat]) => [lat, lng])
        L.polyline(linePts, { color: '#10b981', weight: 3, dashArray: '6 4' }).addTo(map)
      }

      if (coords.length) {
        map.fitBounds(coords, { padding: [30, 30] })
      } else {
        map.setView([48.8566, 2.3522], 12)
        this.toast.warning('Aucun conteneur avec coordonnées GPS sur cette tournée.')
      }

      this._mapInstance = map
    },

    _destroyMap() {
      if (this._mapInstance) {
        this._mapInstance.remove()
        this._mapInstance = null
      }
    },

    // ── PDF ────────────────────────────────────────────────────────────────

    async exportPDF(tour) {
      this.exportingPDF = true
      try {
        const res = await routeService.exportPDF(tour.id, this.currentUserName)
        const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `tournee-${(tour.date ?? '').slice(0, 10) || 'export'}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } catch {
        this.toast.error('Erreur lors de la génération du PDF.')
      } finally {
        this.exportingPDF = false
      }
    },

    // ── Helpers ────────────────────────────────────────────────────────────

    isUrgent(tour) {
      if (!['planned', 'in_progress'].includes(tour.status)) return false
      const tourDate = new Date(tour.date).setHours(0, 0, 0, 0)
      return tourDate < this.today
    },

    sortedSteps(tour) {
      return [...(tour.steps ?? [])].sort(
        (a, b) => (a.stepOrder ?? a.order ?? 0) - (b.stepOrder ?? b.order ?? 0)
      )
    },

    nextStop(tour) {
      if (!tour.steps.length) return null
      if (['completed', 'cancelled'].includes(tour.status)) return null
      return this.sortedSteps(tour)[0] ?? null
    },

    progressPct(tour) {
      if (tour.status === 'completed') return 100
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
      return {
        planned:     'badge-warning',
        in_progress: 'badge-info',
        completed:   'badge-success',
        cancelled:   'badge-cancelled',
      }[s] ?? 'badge-warning'
    },

    statusLabel(s) {
      return {
        planned:     'À démarrer',
        in_progress: 'En cours',
        completed:   'Terminée',
        cancelled:   'Annulée',
      }[s] ?? s
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

/* ── Tabs ─────────────────────────────────────── */
.tour-tabs {
  display: flex; gap: 4px;
  background: #f1f5f9; border-radius: 14px; padding: 4px;
}
.tab-btn {
  flex: 1; padding: 8px 12px; border-radius: 10px;
  font-size: .85rem; font-weight: 600; color: #64748b;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: all .2s;
}
.tab-btn:hover { color: #0f172a; }
.tab-active { background: white; color: #0f172a; box-shadow: 0 2px 8px rgba(15,23,42,.08); }
.tab-count {
  background: #e2e8f0; color: #475569;
  border-radius: 999px; padding: 1px 7px; font-size: .75rem;
}
.tab-active .tab-count { background: #dcfce7; color: #166534; }

/* ── Tour cards ───────────────────────────────── */
.tour-card {
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 18px; padding: 18px; cursor: pointer; transition: all .25s;
}
.tour-card:hover { transform: translateY(-2px); border-color: #a7f3d0; box-shadow: 0 12px 30px rgba(15,23,42,.06); }
.tour-card-active { background: #ecfdf5; border-color: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,.08); }
.tour-card-urgent { border-color: #fbbf24 !important; background: #fffbeb !important; }
.tour-card-urgent:hover { border-color: #f59e0b !important; }
.tour-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
.tour-meta { margin-top: 6px; color: #64748b; font-size: .85rem; }
.tour-footer { display: flex; justify-content: space-between; margin-top: 14px; color: #64748b; font-size: .85rem; }

.mini-progress { height: 6px; margin-top: 14px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
.mini-progress-bar { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 999px; transition: width .3s; }
.mini-progress-urgent { background: linear-gradient(90deg, #f59e0b, #fbbf24) !important; }

/* ── Badges ───────────────────────────────────── */
.badge { padding: 6px 12px; border-radius: 999px; font-size: .75rem; font-weight: 700; }
.badge-success   { background: #dcfce7; color: #166534; }
.badge-warning   { background: #ffedd5; color: #9a3412; }
.badge-info      { background: #dbeafe; color: #1d4ed8; }
.badge-danger    { background: #fee2e2; color: #991b1b; }
.badge-cancelled { background: #f1f5f9; color: #64748b; }
.badge-urgent    { background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; display: inline-flex; align-items: center; gap: 4px; }

/* ── Detail ───────────────────────────────────── */
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

/* ── Carte ────────────────────────────────────── */
.map-section { position: relative; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; }
.route-map { height: 320px; width: 100%; }
.map-loading-overlay {
  position: absolute; inset: 0; z-index: 500;
  display: flex; align-items: center; justify-content: center;
  background: #f8fafc; color: #64748b; gap: 8px;
}

/* ── Timeline ─────────────────────────────────── */
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

/* ── Actions ──────────────────────────────────── */
.sticky-actions {
  position: sticky; bottom: 0; margin-top: 28px;
  background: white; border-top: 1px solid #e2e8f0;
  padding-top: 18px; display: flex; gap: 12px; flex-wrap: wrap;
}

.btn-primary, .btn-danger, .btn-secondary {
  border-radius: 14px; padding: 12px 18px; font-weight: 600; transition: .2s;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-primary  { background: #10b981; color: white; }
.btn-primary:hover:not(:disabled)   { background: #059669; }
.btn-danger   { background: #ef4444; color: white; }
.btn-danger:hover:not(:disabled)    { background: #dc2626; }
.btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn-secondary:hover:not(:disabled) { background: #e2e8f0; color: #0f172a; }
.btn-primary:disabled, .btn-danger:disabled, .btn-secondary:disabled { opacity: .55; cursor: not-allowed; }

.empty-state { text-align: center; padding: 60px 20px; color: #64748b; }
.empty-state i { font-size: 3rem; display: block; margin-bottom: 16px; color: #94a3b8; }

@media (max-width: 1024px) {
  .tour-overview { grid-template-columns: repeat(2,1fr); }
  .sticky-actions { flex-direction: column; }
}
</style>
