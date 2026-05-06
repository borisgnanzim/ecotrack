<template>
  <div class="min-h-screen bg-slate-100 text-slate-700">

    <!-- Header -->
    <AppHeader />

    <!-- Back -->
    <div class="max-w-6xl mx-auto px-6 mt-4">
      <BackButton />
    </div>

    <!-- Main -->
    <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">

      <!-- Actions -->
      <div class="flex justify-end">
        <button
          @click="showCreate = true; resetForm()"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition cursor-pointer"
        >
          + Créer un conteneur
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="w-full text-sm table-auto">

          <thead class="bg-slate-50 border-b text-xs uppercase tracking-wide text-slate-500">
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
              v-for="c in containers"
              :key="c.id_conteneur"
              class="hover:bg-slate-50 transition duration-150"
            >

              <td class="px-6 py-3 font-medium align-middle">
                {{ c.code_conteneur }}
              </td>

              <td class="px-6 py-3 align-middle">
                {{ c.id_Zone }}
              </td>

              <td class="px-6 py-3 align-middle">
                {{ c.type_Dechet }}
              </td>

              <td class="px-6 py-3 align-middle">
                {{ c.capacite_i ?? '-' }}
              </td>

              <!-- Fill Level -->
              <td class="px-6 py-3">

                <div class="w-full">

                  <div class="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{{ c.fill_level ?? 0 }}%</span>
                  </div>

                  <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="fillColor(c.fill_level)"
                      :style="{ width: (c.fill_level ?? 0) + '%' }"
                    />
                  </div>

                </div>

              </td>

              <!-- Status -->
              <td class="px-6 py-3 align-middle">

                <span
                  class="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                  :class="statusStyles[c.Statut || 'OK']"
                >
                  {{ c.Statut || 'OK' }}
                </span>

              </td>

              <!-- Actions -->
              <td class="px-6 py-3 text-right">

                <div class="inline-flex items-center gap-4">

                  <button
                    @click="openEdit(c)"
                    class="text-emerald-600 hover:underline font-medium cursor-pointer btn-edit"
                  >
                    Modifier
                  </button>

                  <button
                    @click="openInspect(c)"
                    class="text-blue-600 hover:underline font-medium cursor-pointer btn-inspect"
                  >
                    Inspecter
                  </button>

                  <button
                    @click="showDelete = c.id_conteneur"
                    class="text-red-600 hover:underline font-medium cursor-pointer btn-delete"
                  >
                    Supprimer
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

          <input v-model="form.code_conteneur" placeholder="Code conteneur" class="input" />

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

          <input v-model="form.id_Zone" placeholder="Zone (ex: Centre-ville)" class="input" />

          <input v-model="form.type_Dechet" placeholder="Type (OM, Verre...)" class="input" />

          <input v-model="form.capacite_i" placeholder="Capacité (L)" class="input" />

          <select v-model="form.Statut" class="input">
            <option value="OK">OK</option>
            <option value="ALERTE">ALERTE</option>
            <option value="URGENT">URGENT</option>
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
              <strong>{{ selectedContainer.code_conteneur }}</strong>
            </div>

            <div class="inspect-row">
              <span>Zone</span>
              <strong>{{ selectedContainer.id_Zone }}</strong>
            </div>

            <div class="inspect-row">
              <span>Type</span>
              <strong>{{ selectedContainer.type_Dechet }}</strong>
            </div>

            <div class="inspect-row">
              <span>Capacité</span>
              <strong>{{ selectedContainer.capacite_i }} L</strong>
            </div>

            <div class="inspect-row">
              <span>Remplissage</span>
              <strong>{{ selectedContainer.fill_level }}%</strong>
            </div>

            <div class="inspect-row">
              <span>Statut</span>
              <span :class="['status-badge', statusStyles[selectedContainer.Statut]]">
                {{ selectedContainer.Statut }}
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

export default {

  name: "ManageContainersPage",

  components: {
    BackButton,
    AppHeader
  },

  data() {

    return {

      containers: [],
      ourContainers: [],
      loading: true,

      showCreate: false,
      showDelete: null,

      showInspect: null,
      selectedContainer: null,
      isEdit: false,

      form: {
        code_conteneur: "",
        id_Zone: "",
        type_Dechet: "",
        capacite_i: "",
        Statut: "OK",
        address: "",
        latitude: null,
        longitude: null
      },
      suggestions: [],
      timeout: null,

      statusStyles: {
        OK: "bg-emerald-100 text-emerald-700",
        ALERTE: "bg-amber-100 text-amber-700",
        URGENT: "bg-red-100 text-red-700"
      },

    }

  },

  mounted() {
    this.fetchContainers()
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
      }
    },

    fetchContainers() {
      setTimeout(() => {
        this.containers = [
          {
            id_conteneur: 1,
            code_conteneur: 101,
            id_Zone: "Centre-ville",
            type_Dechet: "OM",
            capacite_i: 660,
            fill_level: 42,
            Statut: "OK"
          },
          {
            id_conteneur: 2,
            code_conteneur: 102,
            id_Zone: "Nord",
            type_Dechet: "Verre",
            capacite_i: 500,
            fill_level: 78,
            Statut: "ALERTE"
          },
          {
            id_conteneur: 3,
            code_conteneur: 103,
            id_Zone: "Sud",
            type_Dechet: "Plastique",
            capacite_i: 660,
            fill_level: 95,
            Statut: "URGENT"
          },
          {
            id_conteneur: 4,
            code_conteneur: 104,
            id_Zone: "Est",
            type_Dechet: "Papier",
            capacite_i: 400,
            fill_level: 63,
            Statut: "OK"
          },
          {
            id_conteneur: 5,
            code_conteneur: 105,
            id_Zone: "Ouest",
            type_Dechet: "OM",
            capacite_i: 660,
            fill_level: 88,
            Statut: "ALERTE"
          }
        ];

        this.loading = false;
      }, 800);
    },

    resetForm() {
      this.form = {
        code_conteneur: "",
        id_Zone: "",
        type_Dechet: "",
        capacite_i: "",
        Statut: "OK"
      }
      this.isEdit = false
      this.selectedContainer = null
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
      this.form.address = s.display_name
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
          code_conteneur: Number(this.form.code_conteneur),
          capacite_i: Number(this.form.capacite_i),
          latitude: geo?.latitude || null,
          longitude: geo?.longitude || null
        }
        console.log(payload)
        const myAdress = await streetMapService.reverseGeocode(geo.latitude, geo.longitude)
        console.log(myAdress)
        // await containerService.create(payload)

        this.closeCreate()
        this.fetchContainers()

      } catch (e) {
        console.error("Erreur création", e)
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
        this.fetchContainers()

      } catch (e) {
        console.error("Erreur update", e)
      }
    },

    openEdit(container) {
      this.isEdit = true
      this.selectedContainer = container
      this.form = { ...container }
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
        this.fetchContainers()
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
    }

  }

}
</script>

<style scoped src="./containerManage.css"></style>
