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
.min-h-screen {
  background: linear-gradient(180deg, #f0fdf4 0%, #eff6ff 100%);
}

main {
  max-width: 900px;
  margin: 0 auto;
}

.intro-card {
  display: flex;
  gap: 18px;
  align-items: center;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(236, 253, 245, 0.9));
  border: 1px solid rgba(16, 185, 129, 0.22);
  border-radius: 24px;
  padding: 24px 26px;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.06);
}

.intro-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: #ecfdf5;
  color: #059669;
  font-size: 28px;
  box-shadow: 0 10px 30px rgba(5, 150, 105, 0.12);
}

.intro-card h2 {
  font-size: 1.8rem;
  margin: 0;
  color: #0f172a;
}

.intro-card p {
  margin: 6px 0 0;
  color: #475569;
  line-height: 1.6;
}

.bg-white.rounded-xl.shadow.p-8 {
  border-radius: 28px;
  padding: 34px;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.08);
}

.input-modern {
  width: 100%;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid #d1d5db;
  background: #f8fafc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.input-modern:focus {
  border-color: #059669;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
}

.upload-box {
  border: 2px dashed rgba(16, 185, 129, 0.35);
  border-radius: 20px;
  padding: 26px;
  text-align: center;
  color: #475569;
  position: relative;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.upload-box:hover {
  border-color: #059669;
  background: rgba(236, 253, 245, 0.9);
  color: #0f172a;
}

.upload-box i {
  font-size: 24px;
  margin-bottom: 10px;
}

button[type="submit"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 18px;
  font-weight: 700;
  box-shadow: 0 16px 40px rgba(5, 150, 105, 0.16);
}

button[type="submit"]:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Form card amélioration */
form {
  animation: fadeIn 0.25s ease;
}

@media (max-width: 720px) {
  .intro-card {
    flex-direction: column;
    text-align: center;
  }

  .intro-card h2 {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
