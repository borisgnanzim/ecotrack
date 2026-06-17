<template>
  <div class="manage-zones-page min-h-screen bg-slate-100 text-slate-700">

    <AppHeader />

    <div class="max-w-6xl mx-auto px-6 mt-4">
      <BackButton />
    </div>

    <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">

      <!-- HEADER -->
      <div class="page-header flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-slate-700">Gestion des zones</h2>
          <p class="text-sm text-slate-500 mt-1">Créer et piloter les zones géographiques.</p>
        </div>
        <button class="btn-primary flex items-center gap-2" @click="openCreate">
          <i class="bi bi-plus-circle"></i>
          Nouvelle zone
        </button>
      </div>

      <!-- FILTERS -->
      <div class="filters-container">
        <div class="filters-left">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="filters.search"
              type="text"

              placeholder="Rechercher nom, ville, ID..."
              class="input search-input"
            />
          </div>
        </div>
        <div class="filters-right">
          <select v-model="filters.city" class="input filter-select">
            <option value="">Toutes les villes</option>
            <option v-for="c in cityOptions" :key="c" :value="c">{{ c }}</option>
          </select>
          <select v-model="filters.status" class="input filter-select">
            <option value="">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- PAGINATION -->
      <div class="pagination-container">
        <span class="pagination-info">
          {{ paginatedZones.length ? (page - 1) * perPage + 1 : 0 }} –
          {{ (page - 1) * perPage + paginatedZones.length }}
          sur {{ filteredZones.length }}
        </span>
        <div class="pagination-controls">
          <button class="page-btn" @click="prevPage" :disabled="page === 1">←</button>
          <span class="page-current">{{ page }} / {{ totalPages || 1 }}</span>
          <button class="page-btn" @click="nextPage" :disabled="page >= totalPages">→</button>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-panel bg-white rounded-[28px] shadow-xl overflow-hidden border border-slate-200">
        <table class="w-full text-sm zone-table">
          <thead class="zone-table-head">
            <tr>
              <th class="px-6 py-3 text-left">ID</th>
              <th class="px-6 py-3 text-left">Nom</th>
              <th class="px-6 py-3 text-left">Ville</th>
              <th class="px-6 py-3 text-left">Arrondissement</th>
              <th class="px-6 py-3 text-left">Conteneurs</th>
              <th class="px-6 py-3 text-left">Remplissage moy.</th>
              <th class="px-6 py-3 text-left">Statut</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="z in paginatedZones"
              :key="z.id"
              class="hover:bg-slate-50 transition"
            >
              <td class="px-6 py-3 font-mono text-xs text-slate-500">{{ z.id }}</td>
              <td class="px-6 py-3 font-medium">{{ z.name }}</td>
              <td class="px-6 py-3">{{ z.city }}</td>
              <td class="px-6 py-3 text-slate-500">{{ z.district || '—' }}</td>
              <td class="px-6 py-3">{{ z.containerCount ?? 0 }}</td>
              <td class="px-6 py-3">
                <div v-if="z.avgFillLevel != null" class="flex items-center gap-2">
                  <div class="fill-bar">
                    <div
                      class="fill-bar-inner"
                      :class="fillBarColor(z.avgFillLevel)"
                      :style="{ width: z.avgFillLevel + '%' }"
                    />
                  </div>
                  <span class="text-xs font-semibold" :class="fillTextColor(z.avgFillLevel)">
                    {{ z.avgFillLevel }}%
                  </span>
                </div>
                <span v-else class="text-slate-400 text-xs">—</span>
              </td>
              <td class="px-6 py-3">
                <span :class="z.isActive ? 'status-active' : 'status-inactive'">
                  {{ z.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-3 text-right">
                <div class="inline-flex gap-3">
                  <button class="icon-btn blue" @click="inspect(z)" title="Détails">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="icon-btn green" @click="edit(z)" title="Modifier">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="icon-btn red" @click="del(z)" title="Supprimer">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="loading">
              <td colspan="8" class="px-6 py-10 text-center text-slate-400">Chargement des zones…</td>
            </tr>
            <tr v-else-if="filteredZones.length === 0">
              <td colspan="8" class="px-6 py-10 text-center text-slate-400">Aucune zone trouvée.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>

    <!-- ── MODAL CRÉER / MODIFIER ──────────────────────────────────────────── -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal animate-scaleIn">

        <h2 class="modal-title">{{ isEdit ? 'Modifier la zone' : 'Nouvelle zone' }}</h2>

        <div class="space-y-3">
          <div>
            <label class="field-label">ID de zone *</label>
            <input
              class="input"
              v-model="form.id"
              :disabled="isEdit"
              placeholder="ex : FR-PAR-01, ZB12"
              :class="{ 'opacity-50': isEdit }"
            />
            <p class="field-hint">Identifiant unique, non modifiable après création.</p>
          </div>
          <div>
            <label class="field-label">Nom *</label>
            <input class="input" v-model="form.name" placeholder="ex : Paris Centre" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Ville *</label>
              <input class="input" v-model="form.city" placeholder="ex : Paris" />
            </div>
            <div>
              <label class="field-label">Arrondissement</label>
              <input class="input" v-model="form.district" placeholder="ex : 1er-4e arrondissement" />
            </div>
          </div>
          <div>
            <label class="field-label">Description</label>
            <textarea class="input" v-model="form.description" rows="2" placeholder="Description optionnelle…" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Latitude</label>
              <input class="input" v-model.number="form.latitude" type="number" step="0.0001" placeholder="48.8566" />
            </div>
            <div>
              <label class="field-label">Longitude</label>
              <input class="input" v-model.number="form.longitude" type="number" step="0.0001" placeholder="2.3522" />
            </div>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="isActive" v-model="form.isActive" class="w-4 h-4 accent-emerald-600" />
            <label for="isActive" class="text-sm text-slate-600">Zone active</label>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-ghost" @click="closeForm">Annuler</button>
          <button class="btn-primary" @click="submitZone">
            {{ isEdit ? 'Enregistrer' : 'Créer' }}
          </button>
        </div>

      </div>
    </div>

    <!-- ── MODAL INSPECT ──────────────────────────────────────────────────── -->
    <div v-if="showInspect && selected" class="modal-overlay">
      <div class="modal animate-scaleIn">

        <h2 class="modal-title">{{ selected.name }}</h2>

        <div class="inspect-content">
          <div class="inspect-row"><span>ID</span><strong class="font-mono text-sm">{{ selected.id }}</strong></div>
          <div class="inspect-row"><span>Ville</span><strong>{{ selected.city }}</strong></div>
          <div class="inspect-row"><span>Arrondissement</span><strong>{{ selected.district || '—' }}</strong></div>
          <div class="inspect-row"><span>Description</span><strong>{{ selected.description || '—' }}</strong></div>
          <div class="inspect-row">
            <span>Coordonnées</span>
            <strong>{{ selected.latitude != null ? `${selected.latitude}, ${selected.longitude}` : '—' }}</strong>
          </div>
          <div class="inspect-row"><span>Conteneurs</span><strong>{{ selected.containerCount ?? 0 }}</strong></div>
          <div class="inspect-row">
            <span>Remplissage moy.</span>
            <strong :class="fillTextColor(selected.avgFillLevel)">
              {{ selected.avgFillLevel != null ? selected.avgFillLevel + '%' : '—' }}
            </strong>
          </div>
          <div class="inspect-row">
            <span>Statut</span>
            <span :class="selected.isActive ? 'status-active' : 'status-inactive'">
              {{ selected.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="inspect-row">
            <span>Créée le</span>
            <strong>{{ formatDate(selected.createdAt) }}</strong>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-ghost" @click="showInspect = false">Fermer</button>
        </div>

      </div>
    </div>

    <!-- ── MODAL SUPPRIMER ────────────────────────────────────────────────── -->
    <div v-if="showDel" class="modal-overlay">
      <div class="modal animate-pop text-center">

        <div class="text-red-500 text-4xl mb-3">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>

        <p class="font-semibold text-lg">Supprimer cette zone ?</p>
        <p class="text-sm text-slate-500 mt-1">
          Les conteneurs rattachés seront détachés (zoneId → null). Action irréversible.
        </p>

        <div class="flex justify-center gap-3 mt-6">
          <button class="btn-ghost" @click="closeDel">Annuler</button>
          <button class="btn-danger" @click="confirmDel">Supprimer</button>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader/AppHeader.vue'
import BackButton from '@/components/BackButton.vue'
import zoneService from '@/services/zones/zoneService.js'
import { useToast } from 'vue-toastification'

export default {
  name: 'ManageZones',
  components: { AppHeader, BackButton },

  data() {
    return {
      toast: useToast(),
      zones: [],
      loading: true,

      showForm: false,
      showInspect: false,
      showDel: false,
      isEdit: false,
      selected: null,

      form: {
        id: '',
        name: '',
        city: '',
        district: '',
        description: '',
        latitude: null,
        longitude: null,
        isActive: true,
      },

      filters: {
        search: '',
        city: '',
        status: '',
      },

      page: 1,
      perPage: 20,
    }
  },

  mounted() {
    this.fetchAll()
  },

  computed: {
    cityOptions() {
      return [...new Set(this.zones.map(z => z.city).filter(Boolean))].sort()
    },

    filteredZones() {
      const term = this.filters.search.trim().toLowerCase()
      return this.zones.filter(z => {
        const matchSearch = !term || [z.id, z.name, z.city, z.district]
          .some(v => v?.toLowerCase().includes(term))
        const matchCity = !this.filters.city || z.city === this.filters.city
        const matchStatus =
          !this.filters.status ||
          (this.filters.status === 'active' && z.isActive) ||
          (this.filters.status === 'inactive' && !z.isActive)
        return matchSearch && matchCity && matchStatus
      })
    },

    totalPages() {
      return Math.ceil(this.filteredZones.length / this.perPage)
    },

    paginatedZones() {
      const start = (this.page - 1) * this.perPage
      return this.filteredZones.slice(start, start + this.perPage)
    },
  },

  watch: {
    filters: {
      handler() { this.page = 1 },
      deep: true,
    },
  },

  methods: {
    async fetchAll() {
      this.loading = true
      try {
        const res = await zoneService.getAll()
        this.zones = res.data
      } catch (err) {
        this.toast.error(err.response?.data?.message || 'Erreur lors du chargement des zones.')
      } finally {
        this.loading = false
      }
    },

    // ── Navigation ─────────────────────────────────────────────────────────

    nextPage() { if (this.page < this.totalPages) this.page++ },
    prevPage() { if (this.page > 1) this.page-- },

    // ── CRUD ───────────────────────────────────────────────────────────────

    openCreate() {
      this.resetForm()
      this.isEdit = false
      this.showForm = true
    },

    edit(z) {
      this.isEdit = true
      this.form = {
        id: z.id,
        name: z.name,
        city: z.city,
        district: z.district || '',
        description: z.description || '',
        latitude: z.latitude ?? null,
        longitude: z.longitude ?? null,
        isActive: z.isActive,
      }
      this.showForm = true
    },

    closeForm() {
      this.showForm = false
      this.resetForm()
    },

    resetForm() {
      this.form = {
        id: '', name: '', city: '', district: '',
        description: '', latitude: null, longitude: null, isActive: true,
      }
    },

    async submitZone() {
      if (!this.form.id.trim() || !this.form.name.trim() || !this.form.city.trim()) {
        this.toast.warning('ID, nom et ville sont obligatoires.')
        return
      }

      try {
        const payload = {
          ...this.form,
          latitude:  this.form.latitude  !== '' ? this.form.latitude  : null,
          longitude: this.form.longitude !== '' ? this.form.longitude : null,
        }

        if (this.isEdit) {
          const { id, ...body } = payload
          await zoneService.update(id, body)
          this.toast.success('Zone mise à jour.')
        } else {
          await zoneService.create(payload)
          this.toast.success('Zone créée avec succès.')
        }

        this.closeForm()
        this.fetchAll()
      } catch (err) {
        this.toast.error(err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'enregistrement.')
      }
    },

    inspect(z) {
      this.selected = z
      this.showInspect = true
    },

    del(z) {
      this.selected = z
      this.showDel = true
    },

    closeDel() {
      this.showDel = false
      this.selected = null
    },

    async confirmDel() {
      if (!this.selected) return
      try {
        await zoneService.delete(this.selected.id)
        this.toast.success('Zone supprimée.')
        this.closeDel()
        this.fetchAll()
      } catch (err) {
        this.toast.error(err.response?.data?.message || 'Erreur lors de la suppression.')
      }
    },

    // ── Helpers affichage ─────────────────────────────────────────────────

    fillBarColor(v) {
      if (v == null) return 'bg-slate-200'
      if (v >= 80) return 'bg-red-500'
      if (v >= 60) return 'bg-amber-500'
      return 'bg-emerald-500'
    },

    fillTextColor(v) {
      if (v == null) return 'text-slate-400'
      if (v >= 80) return 'text-red-600'
      if (v >= 60) return 'text-amber-600'
      return 'text-emerald-600'
    },

    formatDate(date) {
      if (!date) return '—'
      return new Date(date).toLocaleDateString('fr-FR')
    },
  },
}
</script>

<style scoped>
.manage-zones-page {
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f4 100%);
}

.page-header {
  padding: 20px 0;
  border-bottom: 1px solid rgba(148,163,184,.18);
}

/* ── Table ───────────────────────────────────────────────────── */
.table-panel {
  border: 1px solid rgba(148,163,184,.18);
  box-shadow: 0 20px 50px rgba(15,23,42,.08);
}

.zone-table { border-collapse: collapse; }

.zone-table-head {
  background: #f8fafc;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: .08em;
  font-size: 12px;
}

.zone-table-head th {
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.zone-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

/* ── Fill bar ────────────────────────────────────────────────── */
.fill-bar {
  width: 72px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.fill-bar-inner { height: 100%; border-radius: 999px; transition: width .3s; }

/* ── Status pills ────────────────────────────────────────────── */
.status-active {
  display: inline-block;
  background: #dcfce7;
  color: #166534;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-inactive {
  display: inline-block;
  background: #f1f5f9;
  color: #64748b;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

/* ── Icon buttons ────────────────────────────────────────────── */
.icon-btn {
  width: 38px; height: 38px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  transition: transform .2s, background .2s, color .2s;
  cursor: pointer; border: none;
  box-shadow: 0 6px 18px rgba(15,23,42,.08);
}
.icon-btn:hover { transform: translateY(-1px); }
.icon-btn i { font-size: 16px; }

.icon-btn.blue { background: #eff6ff; color: #2563eb; }
.icon-btn.blue:hover { background: #2563eb; color: white; }
.icon-btn.green { background: #ecfdf5; color: #059669; }
.icon-btn.green:hover { background: #059669; color: white; }
.icon-btn.red { background: #fef2f2; color: #dc2626; }
.icon-btn.red:hover { background: #dc2626; color: white; }

/* ── Filters ─────────────────────────────────────────────────── */
.filters-container {
  background: white;
  padding: 18px 20px;
  border-radius: 22px;
  box-shadow: 0 16px 40px rgba(15,23,42,.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filters-left { flex: 1; }
.filters-right { display: flex; gap: 10px; }

.search-wrapper { position: relative; max-width: 340px; width: 100%; }
.search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: #94a3b8; font-size: 14px; pointer-events: none;
}
.search-input { padding-left: 36px; background: #f8fafc; }

.filter-select { width: 150px; font-size: 13px; }

/* ── Input ───────────────────────────────────────────────────── */
.input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #334155;
  outline: none;
  background: #fff;
  transition: border-color .2s, box-shadow .2s;
  font-size: 14px;
}
.input::placeholder { color: #94a3b8; }
.input:focus { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,.2); }
textarea.input { resize: vertical; }

/* ── Pagination ──────────────────────────────────────────────── */
.pagination-container {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 4px;
}
.pagination-info { font-size: 13px; color: #64748b; }
.pagination-controls { display: flex; align-items: center; gap: 8px; }
.page-btn {
  width: 32px; height: 32px;
  border-radius: 8px; background: #f1f5f9;
  color: #334155; border: none; cursor: pointer; transition: .2s;
}
.page-btn:hover:not(:disabled) { background: #059669; color: white; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-current { font-size: 13px; color: #475569; min-width: 60px; text-align: center; }

/* ── Modal ───────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}

.modal {
  background: white; border-radius: 24px; padding: 28px;
  width: 100%; max-width: 540px;
  box-shadow: 0 30px 70px rgba(15,23,42,.18);
}

.modal-title { font-size: 20px; font-weight: 700; color: #059669; margin-bottom: 16px; }
.modal-actions { margin-top: 22px; display: flex; justify-content: flex-end; gap: 12px; }

/* ── Buttons ─────────────────────────────────────────────────── */
.btn-primary {
  background: #059669; color: white;
  padding: 11px 18px; border-radius: 14px;
  font-weight: 600; letter-spacing: .01em;
  box-shadow: 0 12px 26px rgba(5,150,105,.14);
  transition: transform .2s, background .2s;
}
.btn-primary:hover { background: #047857; transform: translateY(-1px); }

.btn-ghost {
  padding: 10px 16px; border-radius: 14px;
  color: #475569; background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: background .2s, transform .2s;
}
.btn-ghost:hover { background: #eef2ff; transform: translateY(-1px); }

.btn-danger {
  background: #dc2626; color: white;
  padding: 10px 16px; border-radius: 10px;
  font-weight: 500; transition: all .2s;
}
.btn-danger:hover { background: #b91c1c; transform: translateY(-1px); }

/* ── Inspect ─────────────────────────────────────────────────── */
.inspect-content { display: flex; flex-direction: column; gap: 4px; }
.inspect-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 10px; border-radius: 10px;
  border-bottom: 1px solid #f1f5f9; transition: .2s;
}
.inspect-row:hover { background: #f8fafc; }
.inspect-row span:first-child { font-size: 13px; color: #64748b; }
.inspect-row strong { font-size: 14px; color: #0f172a; }

/* ── Field label / hint ──────────────────────────────────────── */
.field-label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
.field-hint { font-size: 11px; color: #94a3b8; margin-top: 3px; }

/* ── Animations ──────────────────────────────────────────────── */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-scaleIn { animation: scaleIn .2s ease; }

@keyframes pop {
  from { opacity: 0; transform: scale(.92) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-pop { animation: pop .25s cubic-bezier(.22,1,.36,1); }
</style>
