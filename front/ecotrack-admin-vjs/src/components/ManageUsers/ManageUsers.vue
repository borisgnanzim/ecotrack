<template>
  <div class="min-h-screen bg-slate-100 text-slate-700">

    <AppHeader />

    <div class="max-w-6xl mx-auto px-6 mt-4">
      <BackButton />
    </div>

    <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">

      <!-- HEADER ACTION -->
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-slate-700">
          Gestion des utilisateurs
        </h2>

        <button class="btn-primary flex items-center gap-2" @click="openCreate">
          <i class="bi bi-plus-circle"></i>
          Ajouter un utilisateur
        </button>
      </div>

      <!-- FILTERS -->
      <div class="filters-container">

        <!-- LEFT : SEARCH -->
        <div class="filters-left">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>

            <input
              v-model="filters.search"
              type="text"
              placeholder="Rechercher nom, email..."
              class="input search-input"
            />
          </div>
        </div>

        <!-- RIGHT : FILTERS -->
        <div class="filters-right">

          <select v-model="filters.role" class="input filter-select">
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="agent">Agent</option>
            <option value="citizen">Citoyen</option>
            <option value="manager">Manager</option>
          </select>

          <select v-model="filters.status" class="input filter-select">
            <option value="">Tous</option>
            <option value="active">Actif</option>
            <option value="banned">Banni</option>
          </select>

        </div>

      </div>

      <!-- PAGINATION -->
      <div class="pagination-container">

        <span class="pagination-info">
          {{ (page - 1) * perPage + 1 }} - {{ (page - 1) * perPage + paginatedUsers.length }}
          sur {{ filteredUsers.length }}
        </span>

        <div class="pagination-controls">

          <button class="page-btn" @click="prevPage" :disabled="page === 1">
            ←
          </button>

          <span class="page-current">
            {{ page }} / {{ totalPages || 1 }}
          </span>

          <button class="page-btn" @click="nextPage" :disabled="page === totalPages">
            →
          </button>

        </div>

      </div>

      <!-- TABLE -->
      <div class="bg-white rounded-xl shadow overflow-hidden">

        <table class="w-full text-sm">

          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="px-6 py-3 text-left">Nom</th>
              <th class="px-6 py-3 text-left">Email</th>
              <th class="px-6 py-3 text-left">Rôle</th>
              <th class="px-6 py-3 text-left">Statut</th>
              <th class="px-6 py-3 text-left">Créé le</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y">

            <tr
              v-for="u in paginatedUsers"
              :key="u.id"
              class="hover:bg-slate-50 transition"
            >

              <td class="px-6 py-3">
                <div class="flex items-center gap-3">

                  <img
                    :src="u.avatar || defaultAvatar"
                    class="avatar-sm"
                    alt="avatar"
                  />

                  <div class="flex flex-col">
                    <span class="font-medium">{{ u.name }}</span>
                    <span class="text-xs text-slate-400">@{{ u.username }}</span>
                  </div>

                </div>
              </td>

              <td class="px-6 py-3">
                {{ u.email }}
              </td>

              <td class="px-6 py-3">
                {{ getRoleLabel(u.roles) }}
              </td>

              <td class="px-6 py-3">
                <span :class="statusClass(u.isActive)">
                  {{ statusLabel(u.isActive) }}
                </span>
              </td>

              <td class="px-6 py-3 text-sm text-slate-500">
                {{ formatDate(u.createdAt) }}
              </td>

              <!-- ACTIONS -->
              <td class="px-6 py-3 text-right">
                <div class="inline-flex gap-3">

                  <button class="icon-btn blue" @click="inspect(u)">
                    <i class="bi bi-eye"></i>
                  </button>

                  <button class="icon-btn green" @click="edit(u)">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button class="icon-btn red" @click="ban(u)">
                    <i :class="u.isActive === false ? 'bi bi-unlock' : 'bi bi-slash-circle'"></i>
                  </button>

                  <button class="icon-btn red" @click="del(u)">
                    <i class="bi bi-trash"></i>
                  </button>

                </div>
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </main>

    <!-- CREATE / EDIT MODAL -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal animate-scaleIn">

        <h2 class="modal-title">
          {{ isEdit ? 'Modifier utilisateur' : 'Ajouter un utilisateur' }}
        </h2>

        <!-- AVATAR UPLOAD -->
        <div class="flex justify-center mb-4">
          <label class="avatar-upload">

            <img
              v-if="form.avatarPreview"
              :src="form.avatarPreview"
              class="avatar-big"
            />

            <div v-else class="avatar-big placeholder">
              <i class="fa-solid fa-user"></i>
            </div>

            <input type="file" hidden @change="onFileChange" />
          </label>
        </div>

        <div class="space-y-3">

          <input class="input" v-model="form.firstname" placeholder="Prénom" />
          <input class="input" v-model="form.lastname" placeholder="Nom" />
          <input class="input" v-model="form.email" placeholder="Email" />

          <!--<input class="input" v-model="form.address" placeholder="Adresse" />-->
          <input class="input" v-model="form.phone" placeholder="Téléphone" />

          <!-- MULTI ROLES -->
          <select multiple class="input" v-model="form.roles">
            <option value="admin">Administrateur</option>
            <option value="agent">Agent</option>
            <option value="citizen">Citoyen</option>
            <option value="manager">Manager</option>
          </select>

        </div>

        <div class="modal-actions">
          <button class="btn-ghost" @click="closeForm">Annuler</button>

          <button class="btn-primary" @click="submitUser">
            {{ isEdit ? 'Modifier' : 'Créer' }}
          </button>
        </div>

      </div>
    </div>

    <!-- INSPECT MODAL -->
    <div v-if="showInspect" class="modal-overlay">
      <div class="modal animate-scaleIn inspect-modal">

        <div class="text-center mb-4">

          <img
            v-if="selected.avatar"
            :src="selected.avatar"
            class="avatar-big mx-auto"
          />

          <div v-else class="avatar-big placeholder mx-auto">
            {{ initials(selected.name) }}
          </div>

          <h2 class="modal-title mt-3">
            {{ selected.name }}
          </h2>

        </div>

        <div class="inspect-content">

          <div class="inspect-row">
            <span>Email</span>
            <strong>{{ selected.email }}</strong>
          </div>

          <div class="inspect-row">
            <span>Rôle</span>
            <strong>{{ getRoleLabel(selected.roles) }}</strong>
          </div>

          <div class="inspect-row">
            <span>Statut</span>
            <strong :class="statusClass(selected.isActive)">
              {{ statusLabel(selected.isActive) }}
            </strong>
          </div>

        </div>

        <div class="modal-actions">
          <button class="btn-ghost" @click="showInspect = false">
            Fermer
          </button>
        </div>

      </div>
    </div>

    <!-- BAN MODAL -->
    <div v-if="showBan" class="modal-overlay">

      <div class="modal animate-pop text-center">

        <div class="text-red-500 text-3xl mb-2">⚠️</div>

        <p class="font-semibold">
          Confirmer l’action ?
        </p>

        <p class="text-sm text-slate-500 mt-1">
          Cette action change le statut de l’utilisateur
        </p>

        <div class="flex justify-center gap-3 mt-4">

          <button class="btn-ghost" @click="showBan = false">
            Annuler
          </button>

          <button class="btn-danger" @click="confirmBan">
            Confirmer
          </button>

        </div>

      </div>

    </div>

    <!-- DELETE MODAL -->
    <div v-if="showDel" class="modal-overlay">

      <div class="modal animate-pop text-center">

        <div class="text-red-500 text-4xl mb-3">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>

        <p class="font-semibold text-lg">
          Supprimer cet utilisateur ?
        </p>

        <p class="text-sm text-slate-500 mt-2">
          Cette action est irréversible.
        </p>

        <!-- Confirmation text -->
        <div class="mt-5 text-left">

          <label class="block text-sm font-medium text-slate-600 mb-2">
            Tapez <strong>SUPPRIMER</strong> pour confirmer
          </label>

          <input
            v-model="deleteConfirmText"
            type="text"
            class="input"
            placeholder="SUPPRIMER"
          />

          <p
            v-if="deleteConfirmText && deleteConfirmText !== 'SUPPRIMER'"
            class="text-xs text-red-500 mt-2"
          >
            Le texte doit être exactement : SUPPRIMER
          </p>

        </div>

        <div class="flex justify-center gap-3 mt-6">

          <button
            class="btn-ghost"
            @click="closeDeleteModal"
          >
            Annuler
          </button>

          <button
            class="btn-danger"
            :disabled="deleteConfirmText !== 'SUPPRIMER'"
            :class="{
              'opacity-50 cursor-not-allowed': deleteConfirmText !== 'SUPPRIMER'
            }"
            @click="confirmDel"
          >
            Confirmer la suppression
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<script>
import BackButton from "@/components/BackButton.vue"
import AppHeader from "@/components/AppHeader/AppHeader.vue"
import userService from "@/services/manageusers/userService";
import { useToast } from "vue-toastification"

const ROLE_LABELS = {
  admin: 'Administrateur',
  agent: 'Agent',
  citizen: 'Citoyen',
  manager: 'Manager'
}

export default {

  components: { AppHeader, BackButton },

  data() {
    return {
      toast: useToast(),

      users: [],

      showInspect: false,
      showBan: false,
      showForm: false,
      showDel: false,

      isEdit: false,

      selected: null,
      error: '',

      form: {
        id: null,
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        roles: [], // maintenant
        avatarPreview: ''
      },
      defaultAvatar: new URL('/assets/icon/man-profile.png', import.meta.url).href,

      filters: {
        search: '',
        role: '',
        status: ''
      },

      page: 1,
      perPage: 20,

      deleteConfirmText: "",
    }
  },

  mounted(){
    this.fetchAllUsers()
  },

  computed: {

    filteredUsers() {
      return this.users.filter(u => {

        // SEARCH (nom + email + username)
        const search = this.filters.search.toLowerCase()
        const matchesSearch =
          !search ||
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.username?.toLowerCase().includes(search)

        // ROLE
        const matchesRole =
          !this.filters.role ||
          u.roles?.some(r => r.name === this.filters.role)

        // STATUS
        const matchesStatus =
          !this.filters.status ||
          (this.filters.status === 'active' && u.isActive) ||
          (this.filters.status === 'banned' && !u.isActive)

        return matchesSearch && matchesRole && matchesStatus
      })
    },

    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.perPage)
    },

    paginatedUsers() {
      const start = (this.page - 1) * this.perPage
      return this.filteredUsers.slice(start, start + this.perPage)
    }

  },

  watch: {
    filters: {
      handler() {
        this.page = 1
      },
      deep: true
    }
  },

  methods: {

    async fetchAllUsers(){
      try {
        const response =  await userService.getAll()
        this.users = response.data.data
        this.toast.success("Utilisateurs récupérés.")
      } catch (err){
        const message =
          err.response?.data?.message ||
          "Erreur lors de la récupération"

        this.error = message
        this.toast.error(message)
      }
    },

    getRoleLabel(roles) {
      if (!roles || roles.length === 0) return '—'

      return roles
        .map(r => ROLE_LABELS[r.name] || r.name) // fallback si inconnu
        .join(', ')
    },

    // Pagination
    nextPage() {
      if (this.page < this.totalPages) this.page++
    },

    prevPage() {
      if (this.page > 1) this.page--
    },

    /* =========================
       UI STATE
    ========================= */

    openCreate() {
      this.isEdit = false
      this.resetForm()
      this.showForm = true
    },

    closeForm() {
      this.resetForm()
      this.showForm = false
    },

    resetForm() {
      this.form = {
        id: null,
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        roles: [],
        avatarPreview: ''
      }
    },

    formatFirstname(name) {
      return name
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    },

    formatLastname(name) {
      if (!name) return ''
      return name.toUpperCase()
    },

    // Générer un mot de passe
    generatePassword() {
      const length = 12

      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      const lowercase = "abcdefghijklmnopqrstuvwxyz"
      const numbers = "0123456789"
      const special = "!@#$%^&*"

      const all = uppercase + lowercase + numbers + special

      let password = ""

      // garantir au moins 1 de chaque
      password += uppercase[Math.floor(Math.random() * uppercase.length)]
      password += lowercase[Math.floor(Math.random() * lowercase.length)]
      password += numbers[Math.floor(Math.random() * numbers.length)]
      password += special[Math.floor(Math.random() * special.length)]

      // compléter
      for (let i = 4; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)]
      }

      return password
    },

    /* =========================
       CRUD USER
    ========================= */

    async submitUser() {
      try {
        const formattedFirstname = this.formatFirstname(this.form.firstname.trim())
        const formattedLastname = this.formatLastname(this.form.lastname.trim())
        const generatedPassword = this.generatePassword()

        const payload = {
          firstname: formattedFirstname,
          lastname: formattedLastname,
          email: this.form.email,
          password: generatedPassword,
          address: this.form.address || '-',
          phone: this.form.phone || null,
          roleNames: this.form.roles
        }

        if (this.isEdit) {
          this.toast.info("Update non implémenté côté API")
          return
        }

        await userService.createUser(payload)

        this.toast.success("Utilisateur créé avec succès")

        const recup = await userService.getAll()
        this.users = recup.data.data
        this.closeForm()

      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Erreur lors de la création"

        this.toast.error(message)
      }
    },

    edit(u) {
      this.isEdit = true

      this.form = {
        id: u.id,
        firstname: u.name?.split(' ')[0] || '',
        lastname: u.name?.split(' ')[1] || '',
        email: u.email,
        password: '', // jamais pré-remplir
        address: u.address || '',
        phone: u.phone || '',
        roles: u.roles?.map(r => r.name) || [],
        avatarPreview: u.avatar || ''
      }

      this.showForm = true
    },

    /* =========================
       INSPECT / BAN
    ========================= */

    inspect(u) {
      this.selected = u
      this.showInspect = true
    },

    ban(u) {
      this.selected = u
      this.showBan = true
    },

    // A revoir pour la désactivation d'un user
    confirmBan() {
      if (!this.selected) return

      this.selected.status =
        this.selected.status === 'BANNED'
          ? 'ACTIVE'
          : 'BANNED'

      this.showBan = false
    },

    del(u) {
      this.selected = u
      this.deleteConfirmText = ""
      this.showDel = true
    },

    closeDeleteModal() {
      this.showDel = false
      this.deleteConfirmText = ""
    },

    confirmDel() {

      if (this.deleteConfirmText !== "SUPPRIMER") {
        return
      }

      if (!this.selected) return

      const id = this.selected.id

      this.deleteUser(id)

      this.closeDeleteModal()
    },

    async deleteUser(userUuid) {
      try{
        await userService.deleteUser(userUuid)
        this.toast.success("User deleted.")
        const recup = await userService.getAll()
        this.users = recup.data.data
      }catch (e) {
        console.error(e)
      }

    },

    /* =========================
       UTILS UI
    ========================= */

    statusClass(isActive) {
      return isActive ? "status-active" : "status-banned"
    },

    statusLabel(isActive) {
      return isActive ? "ACTIF" : "BANNI"
    },

    initials(name) {
      if (!name) return "?"

      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    },

    onFileChange(e) {
      const file = e.target.files?.[0]
      if (!file) return

      this.form.avatarPreview = URL.createObjectURL(file)
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString()
    }

  }
}
</script>

<style scoped>
/* Inputs */
.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #334155;
  outline: none;
  transition: 0.2s;
}

.input::placeholder {
  color: #94a3b8;
}

.input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

/* Boutons table */
.btn-edit,
.btn-inspect,
.btn-delete {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

/* Couleurs */
.btn-edit {
  color: #10b981;
}
.btn-edit:hover {
  color: #047857;
  text-decoration: underline;
}

.btn-inspect {
  color: #2563eb;
}
.btn-inspect:hover {
  color: #1e40af;
  text-decoration: underline;
}

.btn-delete {
  color: #dc2626;
}
.btn-delete:hover {
  color: #991b1b;
  text-decoration: underline;
}

/* Animation modal */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

/* Modal */
.modal {
  background: white;
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
}

.modal-sm {
  max-width: 400px;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #059669;
  margin-bottom: 12px;
}

.modal-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Boutons */
.btn-primary {
  background: #059669;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 500;
}

.btn-primary:hover {
  background: #047857;
}

.btn-secondary {
  color: #64748b;
}

/* Animations */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-scaleIn {
  animation: scaleIn 0.2s ease;
}

/* Boutons modernes */
.btn-ghost {
  padding: 8px 14px;
  border-radius: 10px;
  color: #64748b;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: #f1f5f9;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* Animations smooth */
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-pop {
  animation: pop 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Transition Vue */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* POur modal inspect */
/* Container */
.inspect-modal {
  padding: 22px;
}

/* Header */
.inspect-header {
  margin-bottom: 10px;
}

/* Content spacing */
.inspect-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Ligne propre */
.inspect-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  transition: 0.2s;
}

/* Hover subtil */
.inspect-row:hover {
  background: #f8fafc;
}

/* Label */
.inspect-row span:first-child {
  font-size: 13px;
  color: #64748b;
}

/* Value */
.inspect-row strong {
  font-size: 14px;
  color: #0f172a;
}

/* Badge statut (amélioré) */
.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

/* séparation propre */
.inspect-row:not(:last-child) {
  border-bottom: 1px solid #f1f5f9;
}

/* effet carte premium */
.inspect-modal {
  padding: 22px;
  animation: scaleIn 0.25s ease;
}

/* titre plus propre */
.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 6px;
}

.status-active {
  background: #dcfce7;
  color: #166534;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-banned {
  background: #fee2e2;
  color: #991b1b;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

/* AVATAR UPLOAD */
.avatar-upload {
  cursor: pointer;
}

.avatar-big {
  width: 80px;
  height: 80px;
  border-radius: 18px;
  object-fit: cover;
  background: #059669;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
}

.placeholder {
  background: #e2e8f0;
  color: #64748b;
}

/* SELECT */
select.input {
  background: white;
}

.avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
  cursor: pointer;
  border: none;
}

.icon-btn i {
  font-size: 16px;
}

/* couleurs */
.icon-btn.blue {
  background: #eff6ff;
  color: #2563eb;
}
.icon-btn.blue:hover {
  background: #2563eb;
  color: white;
}

.icon-btn.green {
  background: #ecfdf5;
  color: #059669;
}
.icon-btn.green:hover {
  background: #059669;
  color: white;
}

.icon-btn.red {
  background: #fef2f2;
  color: #dc2626;
}
.icon-btn.red:hover {
  background: #dc2626;
  color: white;
}

/* =========================
   FILTERS UI
========================= */

.filters-container {
  background: white;
  padding: 14px 16px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* LEFT */
.filters-left {
  flex: 1;
}

/* SEARCH */
.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 340px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding-left: 36px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
  background: white;
}

/* RIGHT */
.filters-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* SELECT */
.filter-select {
  width: 140px;
  font-size: 13px;
  padding: 8px 10px;
  background: #f8fafc;
}

/* =========================
   PAGINATION UI
========================= */

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding: 6px 4px;
}

/* info */
.pagination-info {
  font-size: 13px;
  color: #64748b;
}

/* controls */
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* buttons */
.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #059669;
  color: white;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* current page */
.page-current {
  font-size: 13px;
  color: #475569;
  min-width: 60px;
  text-align: center;
}

select[multiple] {
  height: auto;
  min-height: 90px;
  padding: 8px;
}

select[multiple] option {
  padding: 6px;
  border-radius: 6px;
}
</style>
