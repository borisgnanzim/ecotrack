<template>
  <div class="min-h-screen bg-slate-100 text-slate-700">

    <!-- Header -->
    <AppHeader />

    <!-- Main -->
    <main class="max-w-5xl mx-auto px-6 py-10 space-y-8">

      <!-- Intro -->
      <div class="intro-card">

        <div class="intro-icon">
          <i class="ri-megaphone-line"></i>
        </div>

        <div>
          <h2>Signaler un problème</h2>
          <p>
            Un simple signalement permet une intervention rapide.
            Votre contribution améliore la ville.
          </p>
        </div>

      </div>

      <!-- Form -->
      <div class="bg-white rounded-xl shadow p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">

          <div>
            <label class="block text-sm font-medium text-slate-600">
              Conteneur concerné
            </label>
            <input
              type="text"
              v-model="form.container"
              placeholder="Ex : CTR-078"
              class="input-modern"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600">
              Type de signalement
            </label>
            <select
              v-model="form.type"
              class="input-modern"
            >
              <option>Débordement</option>
              <option>Odeur inhabituelle</option>
              <option>Dégradation</option>
              <option>Conteneur inaccessible</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600">
              Description
            </label>
            <textarea
              rows="4"
              v-model="form.description"
              placeholder="Décrivez le problème rencontré..."
              class="input-modern"
            />
          </div>

          <div class="upload-box">
            <i class="ri-image-line"></i>
            <p>Ajouter une photo</p>

            <input
              type="file"
              accept="image/*"
              @change="handleFile"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="loading"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {{ loading ? "Envoi..." : "Envoyer le signalement" }}
            </button>
          </div>

        </form>
      </div>
    </main>
  </div>
</template>

<script>
import AppHeader from "@/components/AppHeader/AppHeader.vue"
export default {
  components: { AppHeader },
  name: 'DashboardPage',

  data() {
    return {
      loading: false,
      form: {
        container: '',
        type: 'Débordement',
        description: '',
        file: null,
      },
    }
  },

  methods: {
    handleFile(e) {
      this.form.file = e.target.files[0]
    },

    async handleSubmit() {
      this.loading = true

      try {
        console.log('Signalement envoyé :', this.form)

        // 🔥 IMPORTANT pour ton backend
        const formData = new FormData()
        formData.append('container', this.form.container)
        formData.append('type', this.form.type)
        formData.append('description', this.form.description)

        if (this.form.file) {
          formData.append('file', this.form.file)
        }

        // Exemple futur :
        // await reportService.create(formData)

      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
/* Profile button */
.profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  cursor: pointer;
  transition: 0.2s;
}

.profile-btn:hover {
  color: #059669;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #059669;
}

/* Intro */
.intro-card {
  display: flex;
  gap: 16px;
  align-items: center;
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 18px;
}

.intro-icon {
  font-size: 22px;
  color: #059669;
}

/* Inputs modernes */
.input-modern {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  transition: all 0.2s;
}

.input-modern:focus {
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}

/* Bouton */
.btn-primary-lg {
  background: #059669;
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  transition: 0.2s;
}

.btn-primary-lg:hover {
  background: #047857;
  transform: translateY(-1px);
}

/* Upload box */
.upload-box {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #64748b;
  position: relative;
  cursor: pointer;
  transition: 0.2s;
}

.upload-box:hover {
  border-color: #10b981;
  background: #f0fdf4;
  color: #059669;
}

.upload-box input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* Form card amélioration */
form {
  animation: fadeIn 0.25s ease;
}
</style>
