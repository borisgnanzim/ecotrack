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

        <button class="btn-primary" @click="openCreate">
          + Ajouter un utilisateur
        </button>
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
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y">

            <tr
              v-for="u in users"
              :key="u.id"
              class="hover:bg-slate-50 transition"
            >

              <td class="px-6 py-3 font-medium">
                {{ u.name }}
              </td>

              <td class="px-6 py-3">
                {{ u.email }}
              </td>

              <td class="px-6 py-3">
                {{ u.role }}
              </td>

              <td class="px-6 py-3">
                <span :class="statusClass(u.status)">
                  {{ u.status }}
                </span>
              </td>

              <!-- ACTIONS -->
              <td class="px-6 py-3 text-right">

                <div class="inline-flex gap-4">

                  <button class="btn-inspect" @click="inspect(u)">
                    Voir
                  </button>

                  <button class="btn-edit" @click="edit(u)">
                    Modifier
                  </button>

                  <button class="btn-danger" @click="ban(u)">
                    {{ u.status === 'BANNED' ? 'Débloquer' : 'Bannir' }}
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

          <select class="input" v-model="form.role">
            <option disabled value="">Choisir un rôle</option>
            <option>Admin</option>
            <option>Agent</option>
            <option>Citizen</option>
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
            <strong>{{ selected.role }}</strong>
          </div>

          <div class="inspect-row">
            <span>Statut</span>
            <strong :class="statusClass(selected.status)">
              {{ selected.status }}
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

  </div>
</template>

<script>
import BackButton from "@/components/BackButton.vue"
import AppHeader from "@/components/AppHeader/AppHeader.vue"

export default {

  components: { AppHeader, BackButton },

  data() {
    return {

      users: [
        { id: 1, name: "Martin D.", email: "martin@mail.com", role: "Citizen", status: "ACTIVE", avatar: "" },
        { id: 2, name: "Sarah L.", email: "sarah@mail.com", role: "Citizen", status: "ACTIVE", avatar: "" },
        { id: 3, name: "Admin", email: "admin@mail.com", role: "Admin", status: "BANNED", avatar: "" },
      ],

      showInspect: false,
      showBan: false,
      showForm: false,

      isEdit: false,

      selected: null,

      form: {
        id: null,
        firstname: '',
        lastname: '',
        email: '',
        role: '',
        avatarPreview: ''
      }

    }
  },

  methods: {

    /* =========================
       UI STATE
    ========================= */

    openCreate() {
      this.isEdit = false
      this.resetForm()
      this.showForm = true
    },

    closeForm() {
      this.showForm = false
    },

    resetForm() {
      this.form = {
        id: null,
        firstname: '',
        lastname: '',
        email: '',
        role: '',
        avatarPreview: ''
      }
    },

    /* =========================
       CRUD USER
    ========================= */

    submitUser() {

      const fullName = `${this.form.firstname} ${this.form.lastname}`.trim()

      if (this.isEdit) {
        const user = this.users.find(u => u.id === this.form.id)
        if (!user) return

        user.name = fullName
        user.email = this.form.email
        user.role = this.form.role
        user.avatar = this.form.avatarPreview

      } else {
        this.users.push({
          id: Date.now(),
          name: fullName,
          email: this.form.email,
          role: this.form.role,
          status: "ACTIVE",
          avatar: this.form.avatarPreview
        })
      }

      this.closeForm()
    },

    edit(u) {
      this.isEdit = true

      this.form = {
        id: u.id,
        firstname: u.name?.split(' ')[0] || '',
        lastname: u.name?.split(' ')[1] || '',
        email: u.email,
        role: u.role,
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

    confirmBan() {
      if (!this.selected) return

      this.selected.status =
        this.selected.status === 'BANNED'
          ? 'ACTIVE'
          : 'BANNED'

      this.showBan = false
    },

    /* =========================
       UTILS UI
    ========================= */

    statusClass(status) {
      return {
        ACTIVE: "status-active",
        BANNED: "status-banned"
      }[status] || ""
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
</style>
