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
        <button class="btn-primary" @click="openCreate">
          <i class="bi bi-plus-circle"></i>
          Nouvelle tournée
        </button>
      </div>

      <!-- GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- SECTEURS (zones) -->
        <section class="card">
          <h3 class="card-title">
            <i class="ri-map-pin-2-line"></i>
            Secteurs
          </h3>

          <div v-if="loadingZones" class="text-center text-slate-400 py-8">Chargement…</div>

          <div v-else-if="zones.length === 0" class="text-center text-slate-400 py-8">
            Aucun secteur disponible
          </div>

          <div v-else class="space-y-3">
            <div v-for="z in zones" :key="z.id" class="sector-card">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2 font-medium">
                  <i class="ri-building-2-line text-emerald-600"></i>
                  {{ z.name }}
                </div>
                <span class="badge" :class="fillBadge(z.avgFillLevel ?? 0)">
                  {{ z.avgFillLevel ?? 0 }}%
                </span>
              </div>
              <div class="progress">
                <div class="progress-bar" :style="{ width: (z.avgFillLevel ?? 0) + '%' }" />
              </div>
              <div class="meta">
                <i class="bi bi-trash3"></i>
                {{ z.containerCount ?? 0 }} conteneurs
              </div>
            </div>
          </div>
        </section>

        <!-- TOURNÉES -->
        <section class="card lg:col-span-2">
          <h3 class="card-title">
            <i class="ri-route-line"></i>
            Tournées planifiées
          </h3>

          <div v-if="loadingRoutes" class="text-center text-slate-400 py-8">Chargement…</div>

          <div v-else-if="routes.length === 0" class="text-center text-slate-400 py-8">
            Aucune tournée. Créez-en une !
          </div>

          <div v-else class="space-y-4">
            <div v-for="r in routes" :key="r.id" class="tour-card">

              <div class="flex justify-between items-start">
                <div>
                  <h4 class="tour-title">
                    <i class="bi bi-truck"></i>
                    Tournée du {{ formatDate(r.date) }}
                  </h4>
                  <p class="tour-meta">
                    <i class="ri-time-line"></i>
                    {{ r.estimatedTime ? r.estimatedTime + ' min' : '—' }}
                    <span v-if="r.totalDistance" class="dot">•</span>
                    <span v-if="r.totalDistance">
                      <i class="ri-road-map-line"></i>
                      {{ r.totalDistance }} km
                    </span>
                  </p>
                </div>
                <span class="badge" :class="statusClass(r.status)">
                  {{ statusLabel(r.status) }}
                </span>
              </div>

              <div class="tour-load">
                <div class="tour-load-bar" :style="{ width: avgFill(r) + '%' }" />
              </div>

              <div class="tour-footer">
                <span class="meta">
                  <i class="bi bi-box-seam"></i>
                  {{ r.steps.length }} conteneurs
                </span>
                <div class="flex gap-2">
                  <button class="btn-mini" @click="optimizeRoute(r)" :disabled="r.status !== 'planned'" title="Optimiser l'ordre des étapes">
                    <i class="ri-route-line"></i>
                    Optimiser
                  </button>
                  <button class="btn-mini" @click="openAssignModal(r)">
                    <i class="ri-user-add-line"></i>
                    Assigner agent
                  </button>
                  <button class="btn-mini btn-mini-danger" @click="deleteRoute(r.id)">
                    <i class="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>

              <div class="tour-stats">
                <span>
                  <i class="ri-road-map-line"></i>
                  {{ r.totalDistance ?? '?' }} km
                </span>
                <span>
                  <i class="ri-delete-bin-line"></i>
                  {{ r.steps.length }} conteneurs
                </span>
                <span>
                  <i class="ri-user-line"></i>
                  {{ getAgentName(r.agentId) }}
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

        <div v-if="loadingAgents" class="text-center text-slate-400 py-6">Chargement…</div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="a in agentsList" :key="a.id" class="agent-card">
            <div class="flex items-center gap-3">
              <div class="avatar">{{ initials(a) }}</div>
              <div>
                <p class="font-semibold">{{ a.name }}</p>
                <p class="text-xs text-slate-500">{{ a.email }}</p>
              </div>
            </div>
            <div class="agent-meta">
              <span>{{ routesForAgent(a.id) }} tournée(s)</span>
              <span :class="a._busy ? 'text-red-500' : 'text-emerald-600'">
                <i class="bi bi-circle-fill"></i>
                {{ a._busy ? 'En tournée' : 'Disponible' }}
              </span>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- ── MODAL CRÉER TOURNÉE ──────────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="showCreate" class="modal-overlay">
        <div class="assign-modal">

          <div class="modal-header">
            <div>
              <h3>Nouvelle tournée</h3>
              <p class="text-sm text-slate-500 mt-1">Planifiez une collecte</p>
            </div>
            <button @click="showCreate = false" class="close-btn">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <div class="modal-content">
            <div class="form-group">
              <label>Date de collecte *</label>
              <input v-model="createForm.date" type="date" class="input-modern" />
            </div>
            <div class="form-group">
              <label>Agent (optionnel)</label>
              <select v-model="createForm.agentId" class="input-modern">
                <option :value="null">Aucun agent</option>
                <option v-for="a in agentsList" :key="a.id" :value="a.id">
                  {{ a.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Heure de départ</label>
              <input v-model="createForm.startTime" type="time" class="input-modern" />
            </div>

            <!-- Zone + conteneurs -->
            <div class="form-group">
              <label>Zone de collecte (optionnel)</label>
              <select v-model="createForm.zoneId" class="input-modern" @change="onZoneChange">
                <option :value="null">Sélectionner une zone</option>
                <option v-for="z in zones" :key="z.id" :value="z.id">
                  {{ z.name }} — {{ z.city }}
                </option>
              </select>
            </div>

            <div v-if="loadingContainers" class="text-sm text-slate-400 text-center py-2">
              Chargement des conteneurs…
            </div>

            <div v-if="!loadingContainers && zoneContainers.length" class="form-group">
              <label>Conteneurs à inclure</label>

              <!-- Filtres par niveau de remplissage -->
              <div class="fill-filters">
                <button
                  v-for="f in fillFilters" :key="f.value"
                  class="fill-filter-btn"
                  :class="[f.cls, { active: containerFilter === f.value }]"
                  @click="containerFilter = f.value"
                  type="button"
                >
                  {{ f.label }}
                  <span class="fill-filter-count">{{ fillFilterCount(f.value) }}</span>
                </button>
              </div>

              <div class="container-list">
                <label
                  v-for="c in filteredZoneContainers"
                  :key="c.id"
                  class="container-item"
                  :class="{ selected: createForm.containerIds.includes(c.id) }"
                >
                  <input
                    type="checkbox"
                    :value="c.id"
                    v-model="createForm.containerIds"
                    class="container-checkbox"
                  />
                  <div class="container-info">
                    <div class="container-top">
                      <span class="container-code">{{ c.code }}</span>
                      <span class="container-type">{{ c.type }}</span>
                      <span class="fill-badge" :class="fillClass(c.fillLevel)">
                        {{ c.fillLevel ?? 0 }}%
                      </span>
                    </div>
                    <div class="fill-bar-wrap">
                      <div
                        class="fill-bar-inner"
                        :class="fillClass(c.fillLevel)"
                        :style="{ width: (c.fillLevel ?? 0) + '%' }"
                      ></div>
                    </div>
                  </div>
                </label>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                {{ createForm.containerIds.length }} conteneur(s) sélectionné(s)
              </p>
            </div>

            <div v-if="!loadingContainers && createForm.zoneId && !zoneContainers.length" class="text-sm text-slate-400 text-center py-2">
              Aucun conteneur dans cette zone.
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-ghost" @click="showCreate = false">Annuler</button>
            <button class="btn-primary" @click="submitCreate">Créer la tournée</button>
          </div>

        </div>
      </div>
    </transition>

    <!-- ── MODAL ASSIGNER AGENT ────────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="showAssignModal" class="modal-overlay">
        <div class="assign-modal">

          <div class="modal-header">
            <div>
              <h3>Affectation tournée</h3>
              <p class="text-sm text-slate-500">Tournée du {{ formatDate(selectedRoute?.date) }}</p>
            </div>
            <button @click="showAssignModal = false" class="close-btn">
              <i class="ri-close-line"></i>
            </button>
          </div>

          <div class="modal-content">
            <div class="form-group">
              <label>Agent</label>
              <select v-model="assignForm.agentId" class="input-modern">
                <option :value="null">Sélectionner un agent</option>
                <option v-for="a in agentsList" :key="a.id" :value="a.id">
                  {{ a.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Heure de départ</label>
              <input v-model="assignForm.startTime" type="time" class="input-modern" />
            </div>
            <div class="form-group">
              <label>Consignes</label>
              <textarea v-model="assignForm.notes" rows="3" class="input-modern" placeholder="Informations complémentaires…" />
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-ghost" @click="showAssignModal = false">Annuler</button>
            <button class="btn-primary" @click="submitAssign">Confirmer l'affectation</button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader/AppHeader.vue"
import BackButton from "@/components/BackButton.vue"
import routeService from "@/services/routes/routeService.js"
import zoneService from "@/services/zones/zoneService.js"
import userService from "@/services/manageusers/userService.js"
import { useToast } from "vue-toastification"

export default {
  components: { AppHeader, BackButton },

  data() {
    return {
      toast: useToast(),

      routes:       [],
      zones:        [],
      agentsList:   [],

      loadingRoutes: true,
      loadingZones:  true,
      loadingAgents: true,

      showCreate:      false,
      showAssignModal: false,
      selectedRoute:   null,

      zoneContainers:    [],
      loadingContainers: false,
      containerFilter:   'all',

      createForm: {
        date:         '',
        agentId:      null,
        startTime:    '',
        zoneId:       null,
        containerIds: [],
      },

      assignForm: {
        agentId:   null,
        startTime: '',
        notes:     '',
      },
    }
  },

  mounted() {
    this.fetchAll()
  },

  computed: {
    fillFilters() {
      return [
        { value: 'all',  label: 'Tous',     cls: 'filter-all'  },
        { value: 'high', label: '≥ 80%',    cls: 'filter-high' },
        { value: 'mid',  label: '50–79%',   cls: 'filter-mid'  },
        { value: 'low',  label: '< 50%',    cls: 'filter-low'  },
      ]
    },

    filteredZoneContainers() {
      if (this.containerFilter === 'all') return this.zoneContainers
      return this.zoneContainers.filter(c => {
        const lvl = c.fillLevel ?? 0
        if (this.containerFilter === 'high') return lvl >= 80
        if (this.containerFilter === 'mid')  return lvl >= 50 && lvl < 80
        if (this.containerFilter === 'low')  return lvl < 50
        return true
      })
    },

    // agents avec flag _busy si une tournée in_progress leur est assignée
    agentsListWithStatus() {
      return this.agentsList.map(a => ({
        ...a,
        _busy: this.routes.some(r => r.agentId === a.id && r.status === 'in_progress'),
      }))
    },
  },

  methods: {
    async fetchAll() {
      await Promise.all([
        this.fetchRoutes(),
        this.fetchZones(),
        this.fetchAgents(),
      ])
    },

    async fetchRoutes() {
      this.loadingRoutes = true
      try {
        const res = await routeService.getAll()
        this.routes = res.data
      } catch {
        this.toast.error('Erreur lors du chargement des tournées.')
      } finally {
        this.loadingRoutes = false
      }
    },

    async fetchZones() {
      this.loadingZones = true
      try {
        const res = await zoneService.getAll()
        this.zones = res.data.filter(z => z.isActive).slice(0, 5)
      } catch {
        // silencieux
      } finally {
        this.loadingZones = false
      }
    },

    async fetchAgents() {
      this.loadingAgents = true
      try {
        const res = await userService.getAll()
        const users = res.data?.data ?? res.data ?? []
        this.agentsList = users.filter(u =>
          u.roles?.some(r => r.name === 'agent')
        )
      } catch {
        // silencieux
      } finally {
        this.loadingAgents = false
      }
    },

    // ── Create ─────────────────────────────────────────────────────────────

    openCreate() {
      this.createForm = { date: '', agentId: null, startTime: '', zoneId: null, containerIds: [] }
      this.zoneContainers = []
      this.containerFilter = 'all'
      this.showCreate = true
    },

    getAgentName(agentId) {
      if (!agentId) return 'Non assigné'
      const agent = this.agentsList.find(a => a.id === agentId)
      return agent ? agent.name : 'Agent inconnu'
    },

    fillFilterCount(filterValue) {
      if (filterValue === 'all') return this.zoneContainers.length
      return this.zoneContainers.filter(c => {
        const lvl = c.fillLevel ?? 0
        if (filterValue === 'high') return lvl >= 80
        if (filterValue === 'mid')  return lvl >= 50 && lvl < 80
        if (filterValue === 'low')  return lvl < 50
        return true
      }).length
    },

    async onZoneChange() {
      const zid = this.createForm.zoneId
      this.createForm.containerIds = []
      this.zoneContainers = []
      this.containerFilter = 'all'
      if (!zid) return
      this.loadingContainers = true
      try {
        const res = await zoneService.getContainers(zid)
        this.zoneContainers = res.data ?? []
      } catch {
        this.toast.error('Impossible de charger les conteneurs de cette zone.')
      } finally {
        this.loadingContainers = false
      }
    },

    fillClass(level) {
      if (level >= 80) return 'fill-high'
      if (level >= 50) return 'fill-mid'
      return 'fill-low'
    },

    async submitCreate() {
      if (!this.createForm.date) {
        this.toast.warning('La date est obligatoire.')
        return
      }
      try {
        const payload = {
          date:         this.createForm.date,
          agentId:      this.createForm.agentId || null,
          startTime:    this.createForm.startTime
            ? new Date(`${this.createForm.date}T${this.createForm.startTime}`).toISOString()
            : null,
          containerIds: this.createForm.containerIds.length
            ? this.createForm.containerIds
            : undefined,
        }
        await routeService.create(payload)
        this.toast.success('Tournée créée avec succès.')
        this.showCreate = false
        this.fetchRoutes()
      } catch (err) {
        this.toast.error(err.response?.data?.error || 'Erreur lors de la création.')
      }
    },

    // ── Assign ─────────────────────────────────────────────────────────────

    openAssignModal(route) {
      this.selectedRoute = route
      this.assignForm = {
        agentId:   route.agentId || null,
        startTime: '',
        notes:     '',
      }
      this.showAssignModal = true
    },

    async submitAssign() {
      if (!this.assignForm.agentId) {
        this.toast.warning('Sélectionnez un agent.')
        return
      }
      try {
        await routeService.assignAgent(this.selectedRoute.id, this.assignForm.agentId)

        if (this.assignForm.startTime) {
          const date = this.selectedRoute.date.split('T')[0]
          await routeService.update(this.selectedRoute.id, {
            startTime: new Date(`${date}T${this.assignForm.startTime}`).toISOString(),
          })
        }

        this.toast.success('Agent assigné avec succès.')
        this.showAssignModal = false
        this.fetchRoutes()
      } catch (err) {
        this.toast.error(err.response?.data?.error || 'Erreur lors de l\'affectation.')
      }
    },

    // ── Optimize ───────────────────────────────────────────────────────────

    async optimizeRoute(route) {
      try {
        await routeService.optimize(route.id)
        this.toast.success('Tournée optimisée.')
        this.fetchRoutes()
      } catch (err) {
        this.toast.error(err.response?.data?.error || 'Impossible d\'optimiser (min. 2 conteneurs avec GPS).')
      }
    },

    // ── Delete ─────────────────────────────────────────────────────────────

    async deleteRoute(id) {
      if (!confirm('Supprimer cette tournée ?')) return
      try {
        await routeService.delete(id)
        this.toast.success('Tournée supprimée.')
        this.fetchRoutes()
      } catch (err) {
        this.toast.error(err.response?.data?.error || 'Erreur lors de la suppression.')
      }
    },

    // ── Helpers ────────────────────────────────────────────────────────────

    routesForAgent(agentId) {
      return this.routes.filter(r => r.agentId === agentId).length
    },

    avgFill(route) {
      const fills = route.steps
        .map(s => s.container?.fillLevel)
        .filter(v => v != null)
      if (!fills.length) return 0
      return Math.round(fills.reduce((a, b) => a + b, 0) / fills.length)
    },

    initials(user) {
      return (user.name ?? user.username ?? '?')
        .split(' ')
        .map(w => w[0] ?? '')
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?'
    },

    formatDate(iso) {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },

    fillBadge(v) {
      if (v > 80) return 'badge-danger'
      if (v > 50) return 'badge-warning'
      return 'badge-success'
    },

    statusClass(s) {
      return {
        planned:     'badge-info',
        in_progress: 'badge-warning',
        completed:   'badge-success',
        cancelled:   'badge-cancelled',
      }[s] ?? 'badge-info'
    },

    statusLabel(s) {
      return {
        planned:     'Planifiée',
        in_progress: 'En cours',
        completed:   'Terminée',
        cancelled:   'Annulée',
      }[s] ?? s
    },
  },
}
</script>

<style scoped>
.min-h-screen { background: #f8fafc; }
main { min-height: calc(100vh - 112px); }

.card {
  background: white;
  border: 1px solid rgba(148,163,184,.18);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 30px 70px rgba(15,23,42,.08);
}

.page-title {
  font-size: 1.7rem; font-weight: 700; color: #0f172a;
  display: flex; align-items: center; gap: 10px;
}
.page-title i, .card-title i { font-size: 1.2rem; color: #059669; }
.page-subtitle { margin-top: 8px; font-size: .95rem; color: #64748b; max-width: 540px; }
.card-title {
  font-size: 1.05rem; font-weight: 700;
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 20px; color: #0f172a;
}

.sector-card, .tour-card, .agent-card {
  background: #f8fafc;
  border: 1px solid rgba(148,163,184,.18);
  border-radius: 18px; padding: 18px;
  transition: transform .2s, box-shadow .2s;
}
.sector-card:hover, .tour-card:hover, .agent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 48px rgba(15,23,42,.1);
}

.meta, .tour-meta {
  font-size: .92rem; color: #475569;
  display: flex; align-items: center; gap: 8px;
}
.tour-meta { margin-top: 8px; }
.dot { margin: 0 6px; color: #94a3b8; }

.progress {
  height: 8px; background: #e2e8f0;
  border-radius: 999px; margin: 12px 0; overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: 999px;
}

.avatar {
  width: 46px; height: 46px; border-radius: 14px;
  background: #059669; color: white;
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700; box-shadow: 0 12px 30px rgba(5,150,105,.18);
}

.btn-primary {
  background: #059669; color: white;
  padding: 14px 20px; border-radius: 16px;
  display: inline-flex; gap: 10px; align-items: center;
  font-weight: 600; box-shadow: 0 18px 40px rgba(5,150,105,.18);
  transition: all .2s;
}
.btn-primary:hover { background: #047857; transform: translateY(-1px); }

.btn-mini {
  font-size: .85rem; background: #ffffff;
  border: 1px solid rgba(148,163,184,.25);
  padding: 8px 12px; border-radius: 12px;
  display: inline-flex; gap: 6px; align-items: center;
  color: #0f172a; transition: .2s;
}
.btn-mini:hover:not(:disabled) { background: #f8fafc; }
.btn-mini:disabled { opacity: .4; cursor: not-allowed; }
.btn-mini-danger { color: #dc2626; border-color: #fecaca; }
.btn-mini-danger:hover { background: #fef2f2 !important; }

.btn-ghost {
  background: #f8fafc; padding: 12px 16px; border-radius: 16px;
  border: 1px solid rgba(148,163,184,.22); color: #475569; transition: .2s;
}
.btn-ghost:hover { background: white; }

.badge {
  font-size: .8rem; padding: 6px 12px;
  border-radius: 999px; font-weight: 700;
}
.badge-danger    { background: #fee2e2; color: #991b1b; }
.badge-warning   { background: #ffedd5; color: #9a3412; }
.badge-success   { background: #dcfce7; color: #166534; }
.badge-info      { background: #dbeafe; color: #1e40af; }
.badge-cancelled { background: #f1f5f9; color: #64748b; }

.agent-meta {
  display: flex; justify-content: space-between;
  gap: 10px; margin-top: 16px;
  font-size: .9rem; color: #475569;
}
.agent-meta span:last-child { display: inline-flex; align-items: center; gap: 6px; }

.tour-load {
  height: 8px; background: #e2e8f0;
  border-radius: 999px; margin-top: 14px; overflow: hidden;
}
.tour-load-bar {
  height: 100%;
  background: linear-gradient(90deg, #059669, #10b981);
  border-radius: 999px;
}

.tour-footer {
  display: flex; justify-content: space-between;
  align-items: center; margin-top: 14px; gap: 8px; flex-wrap: wrap;
}

.tour-stats {
  display: flex; gap: 18px; flex-wrap: wrap;
  margin-top: 14px; font-size: .85rem; color: #64748b;
}
.tour-title { font-size: 1rem; font-weight: 700; color: #0f172a; display: flex; gap: 8px; align-items: center; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.45); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.assign-modal {
  width: 100%; max-width: 560px;
  max-height: 90vh; display: flex; flex-direction: column;
  background: white; border-radius: 24px; overflow: hidden;
  box-shadow: 0 40px 90px rgba(15,23,42,.15);
}
.modal-content { padding: 24px; overflow-y: auto; }

/* Container selection list */
.container-list {
  display: flex; flex-direction: column; gap: 8px;
  max-height: 260px; overflow-y: auto;
  padding-right: 4px;
}
.container-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 12px;
  border: 1.5px solid #e2e8f0; cursor: pointer;
  transition: border-color .15s, background .15s;
}
.container-item:hover { border-color: #a7f3d0; background: #f0fdf4; }
.container-item.selected { border-color: #059669; background: #f0fdf4; }
.container-checkbox { accent-color: #059669; width: 16px; height: 16px; flex-shrink: 0; }
.container-info { flex: 1; min-width: 0; }
.container-top {
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap; margin-bottom: 6px;
}
.container-code { font-weight: 700; font-size: .88rem; color: #0f172a; font-family: monospace; }
.container-type { font-size: .78rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 999px; }
.fill-badge {
  font-size: .78rem; font-weight: 700;
  padding: 2px 8px; border-radius: 999px; margin-left: auto;
}
.fill-bar-wrap {
  height: 5px; background: #e2e8f0; border-radius: 999px; overflow: hidden;
}
.fill-bar-inner { height: 100%; border-radius: 999px; transition: width .3s; }
.fill-high .fill-bar-inner, .fill-bar-inner.fill-high { background: #ef4444; }
.fill-mid  .fill-bar-inner, .fill-bar-inner.fill-mid  { background: #f97316; }
.fill-low  .fill-bar-inner, .fill-bar-inner.fill-low  { background: #10b981; }
.fill-high { background: #fee2e2; color: #991b1b; }
.fill-mid  { background: #ffedd5; color: #9a3412; }
.fill-low  { background: #dcfce7; color: #166534; }
.modal-header {
  padding: 24px; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
  flex-shrink: 0;
}
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: #059669; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: .9rem; }
.input-modern {
  width: 100%; padding: 12px 14px;
  border-radius: 12px; border: 1px solid #cbd5e1;
  background: #f8fafc; font-size: .9rem; transition: .2s;
}
.input-modern:focus { outline: none; border-color: #10b981; background: white; }
textarea.input-modern { resize: vertical; }
.modal-actions {
  padding: 20px 24px; border-top: 1px solid #e2e8f0;
  display: flex; justify-content: flex-end; gap: 12px;
  flex-shrink: 0;
}
.close-btn {
  width: 38px; height: 38px; border-radius: 12px;
  background: #f8fafc; display: flex; align-items: center; justify-content: center;
}
.close-btn:hover { background: #e2e8f0; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Fill-level filter chips */
.fill-filters {
  display: flex; gap: 6px; flex-wrap: wrap;
  margin-bottom: 10px;
}
.fill-filter-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 999px;
  font-size: .78rem; font-weight: 600;
  border: 1.5px solid transparent;
  cursor: pointer; transition: all .15s;
  opacity: .6;
}
.fill-filter-btn.active { opacity: 1; border-color: currentColor; }
.fill-filter-btn:hover  { opacity: .9; }
.fill-filter-count {
  background: rgba(0,0,0,.1); border-radius: 999px;
  padding: 1px 6px; font-size: .72rem;
}

.filter-all  { background: #f1f5f9; color: #475569; }
.filter-high { background: #fee2e2; color: #991b1b; }
.filter-mid  { background: #ffedd5; color: #9a3412; }
.filter-low  { background: #dcfce7; color: #166534; }
</style>
