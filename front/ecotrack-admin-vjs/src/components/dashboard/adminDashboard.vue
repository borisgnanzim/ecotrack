<template>
  <div class="dashboard">

    <!-- Header -->
    <AppHeader />

    <!-- Main -->
    <main class="container">

      <!-- Action -->
      <div class="actions">
        <router-link to="/contain-management" class="btn-primary">
          Gérer les conteneurs
        </router-link>
      </div>

      <!-- Stats -->
      <section class="stats-grid">
        <StatCard
          label="Conteneurs actifs"
          :value="stats.containers"
          color="text-emerald-600"
        />

        <StatCard
          label="Alertes"
          :value="stats.alerts"
          color="text-amber-600"
        />

        <StatCard
          label="Signalements"
          :value="stats.reports"
          color="text-red-600"
        />

        <StatCard
          label="Tournées"
          :value="stats.routes"
          color="text-slate-600"
        />
      </section>

      <!-- Map -->
      <section class="card bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 class="text-lg font-semibold mb-4">Carte des conteneurs</h2>

        <div class="map-placeholder">
          Carte temps réel (Leaflet / Mapbox à venir)
        </div>
      </section>

      <!-- Table -->
      <section class="card">
        <h2>État des conteneurs</h2>

        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Zone</th>
              <th>Type</th>
              <th>Remplissage</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in containers" :key="c.id">
              <td class="code">{{ c.code }}</td>
              <td>{{ c.zone }}</td>
              <td>{{ c.type }}</td>

              <!-- Fill -->
              <td>
                <div class="progress">
                  <div
                    class="progress-bar"
                    :class="fillColor(c.fill)"
                    :style="{ width: c.fill + '%' }"
                  ></div>
                </div>
                <span class="percent">{{ c.fill }}%</span>
              </td>

              <!-- Status -->
              <td>
                <span :class="statusClass(c.status)">
                  {{ c.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

      </section>

    </main>
  </div>
</template>

<script>
import AppHeader from "../AppHeader/AppHeader.vue";
import StatCard from "./StatCard.vue";

export default {
  name: "DashboardPage",

  components: {
    AppHeader,
    StatCard
  },

  data() {
    return {

      // MOCK STATS
      stats: {
        containers: 128,
        alerts: 12,
        reports: 5,
        routes: 3
      },

      // MOCK TABLE
      containers: [
        { id: 1, code: "CTR-001", zone: "Centre-ville", type: "OM", fill: 45, status: "OK" },
        { id: 2, code: "CTR-014", zone: "Nord", type: "Verre", fill: 82, status: "ALERTE" },
        { id: 3, code: "CTR-078", zone: "Sud", type: "Plastique", fill: 97, status: "URGENT" },
        { id: 4, code: "CTR-032", zone: "Est", type: "Papier", fill: 63, status: "OK" },
      ]
    }
  },

  methods: {

    fillColor(value) {
      if (value < 70) return "green"
      if (value < 90) return "orange"
      return "red"
    },

    statusClass(status) {
      return {
        badge: true,
        ok: status === "OK",
        alert: status === "ALERTE",
        urgent: status === "URGENT"
      }
    }

  }
}
</script>

<style scoped>

/* Layout */
.dashboard {
  min-height: 100vh;
  background: #f1f5f9;
}

.container {
  max-width: 1200px;
  margin: auto;
  padding: 24px;
}

/* Actions */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn-primary {
  background: #059669;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 500;
  text-decoration: none;
  transition: 0.2s;
}

.btn-primary:hover {
  background: #047857;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

/* Cards */
.card {
  background: white;
  padding: 20px;
  border-radius: 14px;
  margin-top: 20px;
  border: 1px solid #e2e8f0;
}

/* Map */
.map-placeholder {
  height: 280px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

/* Table */
.table {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 10px;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f1f5f9;
}

.code {
  font-weight: 600;
}

/* Progress bar */
.progress {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
}

.green {
  background: #10b981;
}

.orange {
  background: #f59e0b;
}

.red {
  background: #ef4444;
}

.percent {
  font-size: 12px;
  color: #64748b;
}

/* Badges */
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.ok {
  background: #d1fae5;
  color: #065f46;
}

.alert {
  background: #fef3c7;
  color: #92400e;
}

.urgent {
  background: #fee2e2;
  color: #991b1b;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 10px;
}

</style>
