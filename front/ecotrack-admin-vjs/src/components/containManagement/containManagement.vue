<template>
  <div class="min-h-screen bg-slate-100 text-slate-700">

    <!-- Header -->
    <AppHeader />

    <!-- Back -->
    <div class="max-w-6xl mx-auto px-6 mt-4">
      <!-- à mettre à gauche-->
      <BackButton />
    </div>

    <!-- Main -->
    <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">

      <!-- Page header -->
      <div class="page-header">
        <div>
          <h2 class="text-xl font-semibold text-slate-700">Gestion des containers</h2>
          <p class="text-sm text-slate-500 mt-1">Filtrer et piloter les conteneurs actifs.</p>
        </div>

        <button class="btn-primary flex items-center gap-2" @click="openCreate">
          <i class="bi bi-plus-circle"></i>
          Nouveau conteneur
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-card">

        <div class="filters-header">
          <h3>
            <i class="ri-filter-3-line"></i>
            Filtres
          </h3>

          <button
            @click="resetFilters"
            class="btn-ghost filter-reset"
          >
            <i class="ri-refresh-line"></i>
            Réinitialiser
          </button>
        </div>

        <div class="filters-stats">

          <div class="stat-card">
            <span class="stat-label">Total</span>
            <strong>{{ ourContainers.length }}</strong>
          </div>

          <div class="stat-card">
            <span class="stat-label">Affichés</span>
            <strong>{{ filteredContainers.length }}</strong>
          </div>

          <div class="stat-card">
            <span class="stat-label">Normaux</span>
            <strong>{{ normalCount }}</strong>
          </div>

          <div class="stat-card">
            <span class="stat-label">Pleins</span>
            <strong>{{ fullCount }}</strong>
          </div>

          <div class="stat-card">
            <span class="stat-label">Maintenance</span>
            <strong>{{ maintenanceCount }}</strong>
          </div>

        </div>

        <div class="filters-grid">

          <div class="search-wrapper filter-search">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="filters.search"
              type="search"
              placeholder="Rechercher un conteneur..."
              class="input search-input"
            />
          </div>

          <input
            v-model="filters.zone"
            placeholder="Zone"
            class="input"
          />

          <select
            v-model="filters.type"
            class="input"
          >
            <option value="">Tous les types</option>
            <option
              v-for="type in typeOptions"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>

          <select
            v-model="filters.status"
            class="input"
          >
            <option value="">Tous les statuts</option>
            <option
              v-for="status in statusOptions"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>

        </div>

      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="max-h-155 overflow-y-auto">
          <table class="w-full text-sm table-auto">

            <thead class="bg-slate-50 border-b text-xs uppercase tracking-wide text-slate-500 sticky top-0 z-20">
            <tr class="text-left text-slate-500">
              <th class="px-6 py-3">Code</th>
              <th class="px-6 py-3">Zone</th>
              <th class="px-6 py-3">Type</th>
              <th class="px-6 py-3">Capacité</th>
              <th class="px-6 py-3">Remplissage</th>
              <th class="px-6 py-3">Statut</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y">

            <tr
              v-for="c in filteredContainers"
              :key="c.id"
              class="hover:bg-slate-50 transition duration-150"
            >

              <td class="px-6 py-3 font-medium align-middle">
                {{ c.code }}
              </td>

              <td class="px-6 py-3 align-middle">
                {{ c.zoneId }}
              </td>

              <td class="px-6 py-3 align-middle">
                {{ c.type }}
              </td>

              <td class="px-6 py-3 align-middle">
                {{ c.capacity ?? '-' }}
              </td>

              <!-- Fill Level -->
              <td class="px-6 py-3">

                <div class="w-full">

                  <div class="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{{ c.fillLevel ?? 0 }}%</span>
                  </div>

                  <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="fillColor(c.fillLevel)"
                      :style="{ width: (c.fillLevel ?? 0) + '%' }"
                    />
                  </div>

                </div>

              </td>

              <!-- Status -->
              <td class="px-6 py-3 align-middle">

                <span
                  class="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                  :class="statusStyles[c.status || 'OK']"
                >
                  {{ formatTextStatus(c.status) }}
                </span>

              </td>

              <!-- Actions -->
              <td class="px-6 py-3 text-right">

                <div class="inline-flex items-center gap-3">

                  <button
                    @click="openEdit(c)"
                    title="Modifier"
                    class="action-button action-edit"
                  >
                    <i class="ri-pencil-line text-xl"></i>
                  </button>

                  <button
                    @click="openInspect(c)"
                    title="Inspecter"
                    class="action-button action-inspect"
                  >
                    <i class="ri-eye-line text-xl"></i>
                  </button>

                  <button
                    @click="showDelete = c.id"
                    title="Supprimer"
                    class="action-button action-delete"
                  >
                    <i class="ri-delete-bin-6-line text-xl"></i>
                  </button>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

        <div
          v-if="loading"
          class="p-6 text-center text-slate-500"
        >
          Chargement des conteneurs…
        </div>

      </div>
      </div>
    </main>

    <!-- MODAL CREATE -->
    <div
      v-if="showCreate"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
    >

      <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 space-y-6 animate-fadeIn">

        <!-- Title -->
        <div>
          <h2 class="text-xl font-bold text-emerald-700">
            {{ isEdit ? "Modifier le conteneur" : "Nouveau conteneur" }}
          </h2>
          <p class="text-sm text-slate-500">
            Ajouter un conteneur dans le système
          </p>
        </div>

        <!-- Form -->
        <div class="space-y-4">

          <div class="relative">
            <input
              v-model="form.address"
              @input="onSearchAddress"
              placeholder="Adresse du conteneur"
              class="input"
            />

            <!-- Suggestions -->
            <ul v-if="suggestions.length" class="suggestions">
              <li
                v-for="s in suggestions"
                :key="s.place_id"
                @click="selectAddress(s)"
              >
                {{ formatAddress(s) }}
              </li>
            </ul>
          </div>

          <input v-model="form.zoneId" placeholder="Zone (ex: Centre-ville)" class="input" />

          <select v-model="form.type" class="input">
            <option value="">Type de déchet</option>
            <option v-for="type in typeOptions" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>

          <input v-model="form.capacity" placeholder="Capacité (L)" class="input" />

          <select v-model="form.status" class="input">
            <option value="">Statut</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>

        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">

          <button
            @click="showCreate = false"
            class="px-4 py-2 text-slate-500 hover:text-slate-700 transition"
          >
            Annuler
          </button>

          <button
            @click="isEdit ? handleUpdate() : handleCreate()"
            class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition"
          >
            {{ isEdit ? "Mettre à jour" : "Créer" }}
          </button>

        </div>

      </div>

    </div>

    <!-- MODAL DELETE -->
    <transition name="fade">
      <div
        v-if="showDelete"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="modal animate-pop">

          <div class="text-center space-y-3">
            <div class="text-red-500 text-3xl">⚠️</div>

            <p class="text-slate-700 font-medium">
              Supprimer ce conteneur ?
            </p>

            <p class="text-xs text-slate-500">
              Cette action est irréversible
            </p>
          </div>

          <div class="flex justify-center gap-3 pt-4">
            <button
              @click="closeDelete"
              class="btn-ghost"
            >
              Annuler
            </button>

            <button
              @click="confirmDelete"
              class="btn-danger"
            >
              Supprimer
            </button>
          </div>

        </div>
      </div>
    </transition>

    <!-- MODAL INSPECT -->
    <transition name="fade">
      <div v-if="showInspect" class="modal-overlay">
        <div class="modal modal-sm animate-scaleIn inspect-modal">

          <div class="inspect-header">
            <h2 class="modal-title">Détails du conteneur</h2>
          </div>

          <div class="inspect-content">

            <div class="inspect-row">
              <span>Code</span>
              <strong>{{ selectedContainer.code }}</strong>
            </div>

            <div class="inspect-row">
              <span>Zone</span>
              <strong>{{ selectedContainer.zoneId }}</strong>
            </div>

            <div class="inspect-row">
              <span>Type</span>
              <strong>{{ selectedContainer.type }}</strong>
            </div>

            <div class="inspect-row">
              <span>Capacité</span>
              <strong>{{ selectedContainer.capacity }} L</strong>
            </div>

            <div class="inspect-row">
              <span>Remplissage</span>
              <strong>{{ selectedContainer.fillLevel }}%</strong>
            </div>

            <div class="inspect-row">
              <span>Statut</span>
              <span :class="['status-badge', statusStyles[selectedContainer.status || 'normal']]">
                {{ formatTextStatus(selectedContainer.status || 'normal') }}
              </span>
            </div>

          </div>

          <div class="modal-actions">
            <button @click="showInspect = null" class="btn-ghost">
              Fermer
            </button>
          </div>

        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import BackButton from "@/components/BackButton.vue"
import AppHeader from "@/components/AppHeader/AppHeader.vue"
import containerService from "@/services/container/containerService"
import streetMapService from "@/services/apiStreet/streetMapService"
import streetService from "@/services/apiStreet/streetService"
import { useToast } from "vue-toastification"

const CONTAINERS_STATUS = [
  { value: 'normal', label: 'Normal' },
  { value: 'plein', label: 'Plein' },
  { value: 'en_maintenance', label: 'En maintenance' },
  { value: 'desactive', label: 'Désactivé' }
]
const TYPES_DECHETS = [
  { value: 'plastique', label: 'Plastique' },
  { value: 'papier', label: 'Papier' },
  { value: 'verre', label: 'Verre' },
  { value: 'composte', label: 'Composte' },
  { value: 'textile', label: 'Textile' },
  { value: 'electronique', label: 'Électronique' }
]

export default {

  name: "ManageContainersPage",

  components: {
    BackButton,
    AppHeader
  },

  data() {

    return {
      toast: useToast(),
      ourContainers: [],
      loading: true,

      showCreate: false,
      showDelete: null,

      showInspect: null,
      selectedContainer: null,
      isEdit: false,

      form: {
        zoneId: "",
        type: "",
        capacity: "",
        status: "normal",
        photoUrl: null,
        latitude: null,
        longitude: null
      },
      filters: {
        search: "",
        zone: "",
        type: "",
        status: ""
      },
      suggestions: [],
      timeout: null,

      statusStyles: {

        normal: "bg-emerald-100 text-emerald-700",
        plein: "bg-emerald-100 text-emerald-700",
        full: "bg-amber-100 text-amber-700",
        en_maintenance: "bg-blue-100 text-blue-700",
        desactive: "bg-slate-100 text-slate-700",
        OK: "bg-emerald-100 text-emerald-700",
        ALERTE: "bg-amber-100 text-amber-700",
        URGENT: "bg-red-100 text-red-700"
      },
      typeOptions: TYPES_DECHETS,
      statusOptions: CONTAINERS_STATUS

    }

  },

  mounted() {
    this.fetchAllContainers()
  },

  methods: {

    async fetchAllContainers(){
      try {
        const response =  await containerService.getAll()
        this.ourContainers = response.data

      } catch (err){
        const message =
          err.response?.data?.message ||
          "Erreur lors de l'inscription"

        this.error = message
        this.toast.error(message)
      } finally {
        this.loading = false
      }
    },

    resetForm() {
      this.form = {
        zoneId: "",
        type: "",
        capacity: "",
        status: "normal",
        photoUrl: null,
        latitude: null,
        longitude: null
      }
      this.isEdit = false
      this.selectedContainer = null
    },

    openCreate() {
      this.resetForm()
      this.showCreate = true
    },

    closeCreate() {
      this.showCreate = false
      this.resetForm()
    },

    /**
     * Pour la suggestion des adresses
     */

    async onSearchAddress() {
      clearTimeout(this.timeout)

      // debounce (important pour éviter spam API)
      this.timeout = setTimeout(async () => {
        this.suggestions = await streetService.searchAddress(this.form.address)
      }, 300)
    },

    selectAddress(s) {
      this.form.address = this.formatAddress(s)
      this.form.latitude = parseFloat(s.lat)
      this.form.longitude = parseFloat(s.lon)

      this.suggestions = []
    },

    formatAddress(s) {
      const a = s.address || {}

      return [
        a.house_number,
        a.road,
        a.postcode,
        a.city || a.town || a.village
      ]
        .filter(Boolean)
        .join(" ")
    },

    async handleCreate() {
      try {

        const geo = await streetMapService.geocode(this.form.address)

        const payload = {
          ...this.form,
          capacity: Number(this.form.capacity),
          latitude: geo?.latitude || null,
          longitude: geo?.longitude || null,
        }
        // const myAdress = await streetMapService.reverseGeocode(geo.latitude, geo.longitude)
        // const simpleAddress = await streetMapService.reverseGeocodeShort(geo.latitude, geo.longitude)
        await containerService.create(payload)

        this.toast.success("Conteneur créé avec succès.")

        this.closeCreate()
        this.fetchAllContainers()

      } catch (e) {
        console.error("Erreur création", e)
        this.toast.error("Erreur lors de la création du conteneur.")
      }
    },

    formatTextStatus(status) {
      switch (status) {
        case 'normal':
        case 'OK':
          return 'Normal'
        case 'plein':
        case 'ALERTE':
          return 'Plein'
        case 'en_maintenance':
        case 'maintenance':
          return 'En maintenance'
        case 'desactive':
        case 'disabled':
          return 'Désactivé'
        default:
          return status
       }
    },

    async handleUpdate() {
      try {

        const geo = await streetMapService.geocode(this.form.address)

        const payload = {
          ...this.form,
          latitude: geo?.latitude || this.selectedContainer.latitude,
          longitude: geo?.longitude || this.selectedContainer.longitude
        }
        console.log(payload)
        // await containerService.update(
        //   this.selectedContainer.id_conteneur,
        //   payload
        // )

        this.closeCreate()
        this.fetchAllContainers()

      } catch (e) {
        console.error("Erreur update", e)
      }
    },

    openEdit(container) {
      this.isEdit = true
      this.selectedContainer = container
      this.form = {
        zoneId: container.zoneId || '',
        type: container.type || '',
        capacity: container.capacity || '',
        status: container.status || 'normal',
        address: container.address || '',
        latitude: container.latitude || null,
        longitude: container.longitude || null
      }
      this.showCreate = true
    },

    openInspect(container) {
      this.selectedContainer = container
      this.showInspect = true
    },

    closeDelete() {
      this.showDelete = null
    },

    async confirmDelete() {
      try {
        await containerService.remove(this.showDelete)
        this.closeDelete()
        this.fetchAllContainers()
      } catch (e) {
        console.error(e)
        alert("Impossible de supprimer")
      }
    },

    fillColor(level) {
      const value = level ?? 0

      if (value < 70) return "bg-emerald-500"
      if (value < 90) return "bg-amber-500"
      return "bg-red-500"
    },

    resetFilters() {
      this.filters = {
        search: "",
        zone: "",
        type: "",
        status: ""
      }
    }

  },

  computed: {
    filteredContainers() {
      const term = this.filters.search.toString().trim().toLowerCase()

      return this.ourContainers.filter((container) => {
        const matchesSearch = !term || [
          container.code?.toString(),
          container.zoneId,
          container.type,
          container.status
        ].some((value) => value?.toString().toLowerCase().includes(term))

        const matchesZone = !this.filters.zone || container.zoneId?.toString().toLowerCase().includes(this.filters.zone.toLowerCase())
        const matchesType = !this.filters.type || container.type === this.filters.type
        const matchesStatus = !this.filters.status || container.status === this.filters.status

        return matchesSearch && matchesZone && matchesType && matchesStatus
      })
    },

    normalCount() {
      return this.filteredContainers.filter(
        c => c.status === "normal" || c.status === "OK"
      ).length
    },

    fullCount() {
      return this.filteredContainers.filter(
        c => c.status === "plein" || c.status === "ALERTE"
      ).length
    },

    maintenanceCount() {
      return this.filteredContainers.filter(
        c => c.status === "en_maintenance"
      ).length
    }
  }

}
</script>

<style scoped src="./containerManage.css"></style>
