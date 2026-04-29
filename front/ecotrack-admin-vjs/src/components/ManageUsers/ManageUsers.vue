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

        <button class="btn-primary">
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

    <!-- INSPECT MODAL -->
    <div v-if="showInspect" class="modal-overlay">
      <div class="modal modal-sm animate-scaleIn inspect-modal">

        <h2 class="modal-title">Utilisateur</h2>

        <div class="inspect-content">

          <div class="inspect-row">
            <span>Nom</span>
            <strong>{{ selected.name }}</strong>
          </div>

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
            <strong>{{ selected.status }}</strong>
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
        { id: 1, name: "Martin D.", email: "martin@mail.com", role: "Citizen", status: "ACTIVE" },
        { id: 2, name: "Sarah L.", email: "sarah@mail.com", role: "Citizen", status: "ACTIVE" },
        { id: 3, name: "Admin", email: "admin@mail.com", role: "Admin", status: "BANNED" },
      ],

      showInspect: false,
      showBan: false,

      selected: null

    }
  },

  methods: {

    inspect(u) {
      this.selected = u
      this.showInspect = true
    },

    edit(u) {
      console.log("edit user", u)
    },

    ban(u) {
      this.selected = u
      this.showBan = true
    },

    confirmBan() {
      this.selected.status =
        this.selected.status === 'BANNED'
          ? 'ACTIVE'
          : 'BANNED'

      this.showBan = false
    },

    statusClass(status) {
      return {
        ACTIVE: "status-active",
        BANNED: "status-banned"
      }[status]
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
</style>
