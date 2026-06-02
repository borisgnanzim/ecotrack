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
      <section class="stats-section">
        <div class="stats-header">
          <div>
            <p class="eyebrow">Vue d'ensemble</p>
            <h2>Indicateurs opérationnels</h2>
            <p class="stats-desc">Suivi des conteneurs et des alertes en un coup d'œil.</p>
          </div>
        </div>

        <div class="stats-grid">
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
        </div>
      </section>

      <!-- Map -->
      <section class="card map-card">
        <div class="section-header">
          <div>
            <h2 class="section-title">Carte des conteneurs</h2>
            <p class="section-subtitle">Animation en temps réel simulée pour les conteneurs autour d'Argenteuil.</p>
          </div>
          <div class="map-status-pill">
            <span class="pill pulse">État live</span>
          </div>
        </div>

        <div class="map-placeholder">
          <div id="map" class="map"></div>
          <div class="map-legend" aria-hidden>
            <div class="legend-item"><span class="dot green-dot"></span> OK</div>
            <div class="legend-item"><span class="dot orange-dot"></span> Alerte</div>
            <div class="legend-item"><span class="dot red-dot"></span> Urgent</div>
          </div>
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
              <th>Capacité</th>
              <th>Remplissage</th>
              <th>Statut</th>
              <th>MAJ</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in containers" :key="c.id_container">
              <td class="code">{{ c.code_container }}</td>
              <td>{{ c.id_zone }}</td>
              <td>{{ c.type_dechet }}</td>
              <td>{{ c.capacite_i }} L</td>

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

              <td class="updated-at">{{ c.updatedAt }}</td>
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

import L from "leaflet"
import "leaflet/dist/leaflet.css"

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

      // MOCK TABLE - données simulées proches d'Argenteuil
      containers: [
        {
          id_container: 1,
          code_container: "CTR-ARG-001",
          id_zone: "Centre-ville",
          type_dechet: "OM",
          capacite_i: 120,
          fill: 45,
          status: "OK",
          latitude: 48.9472,
          longitude: 2.2467,
          photo_url: "",
          createdAt: "2026-06-01",
          updatedAt: "2026-06-02",
        },
        {
          id_container: 2,
          code_container: "CTR-ARG-014",
          id_zone: "Les Coteaux",
          type_dechet: "Verre",
          capacite_i: 240,
          fill: 82,
          status: "ALERTE",
          latitude: 48.9515,
          longitude: 2.2598,
          photo_url: "",
          createdAt: "2026-05-28",
          updatedAt: "2026-06-02",
        },
        {
          id_container: 3,
          code_container: "CTR-ARG-078",
          id_zone: "Val Nord",
          type_dechet: "Plastique",
          capacite_i: 120,
          fill: 97,
          status: "URGENT",
          latitude: 48.9408,
          longitude: 2.2333,
          photo_url: "",
          createdAt: "2026-05-30",
          updatedAt: "2026-06-01",
        },
        {
          id_container: 4,
          code_container: "CTR-ARG-032",
          id_zone: "Gare",
          type_dechet: "Papier",
          capacite_i: 240,
          fill: 63,
          status: "OK",
          latitude: 48.9459,
          longitude: 2.2399,
          photo_url: "",
          createdAt: "2026-05-15",
          updatedAt: "2026-06-02",
        },
        {
          id_container: 5,
          code_container: "CTR-ARG-055",
          id_zone: "Rue de la Paix",
          type_dechet: "OM",
          capacite_i: 120,
          fill: 22,
          status: "OK",
          latitude: 48.9499,
          longitude: 2.2435,
          photo_url: "",
          createdAt: "2026-04-10",
          updatedAt: "2026-06-02",
        }
      ]
    }
  },

  mounted() {
    this.initMap()
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
    },

    // Méthode pour initialiser la carte et afficher les conteneurs
    initMap() {
      // Centrer sur Argenteuil
      const center = [48.9472, 2.2467]
      const map = L.map('map').setView(center, 13)

      // Layer OpenStreetMap (GRATUIT)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      // Ajouter un marker animé pour chaque conteneur simulé
      const latlngs = []
      this.containers.forEach((c) => {
        if (!c.latitude || !c.longitude) return
        const lat = c.latitude
        const lng = c.longitude
        latlngs.push([lat, lng])

        const color = c.fill < 70 ? '#10b981' : c.fill < 90 ? '#f59e0b' : '#ef4444'
        const circle = L.circleMarker([lat, lng], {
          radius: 10,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 0.95,
          className: 'pulse-circle-marker'
        }).addTo(map)

        const popup = `
          <div style="font-weight:600; margin-bottom:6px">${c.code_container}</div>
          <div style="font-size:13px; color:#475569">${c.type_dechet} • ${c.id_zone}</div>
          <div style="margin-top:8px; font-size:13px">Remplissage: <strong>${c.fill}%</strong></div>
          <div style="font-size:12px; color:#64748b">Dernière MAJ: ${c.updatedAt}</div>
        `

        circle.bindPopup(popup)
      })

      // Ajuster la vue pour englober tous les marqueurs
      if (latlngs.length) {
        const bounds = L.latLngBounds(latlngs)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      }

      this.map = map
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
  padding: 24px;
  border-radius: 18px;
  margin-top: 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.05);
}

.stats-section {
  margin-top: 8px;
}

.stats-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.stats-desc {
  color: #475569;
  margin-top: 10px;
  max-width: 680px;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.15em;
  color: #059669;
  margin-bottom: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.pill.pulse {
  background: rgba(5, 150, 105, 0.12);
  color: #065f46;
  animation: pulseGlow 2.5s infinite ease-in-out;
}

.pill.pulse {
  background: rgba(5, 150, 105, 0.12);
  color: #065f46;
  animation: pulseGlow 2.5s infinite ease-in-out;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.25); }
  50% { box-shadow: 0 0 0 18px rgba(16, 185, 129, 0.08); }
}

.map-card {
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
  margin-bottom: 18px;
}

.section-title {
  margin: 0;
  font-size: 20px;
}

.section-subtitle {
  margin: 6px 0 0;
  color: #64748b;
}

.map-placeholder {
  min-height: 360px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  position: relative;
  overflow: hidden;
  z-index: 0;
}

.pulse-circle-marker {
  animation: pulseCircle 1.6s ease-in-out infinite;
}

@keyframes pulseCircle {
  0%, 100% { transform: scale(1); opacity: 0.92; }
  50% { transform: scale(1.35); opacity: 0.55; }
}

/* Table */
.table {
  width: 100%;
  margin-top: 10px;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 14px 12px;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.table td {
    padding: 14px 12px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }

  .code {
    font-weight: 700;
    color: #0f172a;
  }

  .updated-at {
    color: #64748b;
    font-size: 13px;
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


.map {
  position: relative; /* créer un stacking context local pour Leaflet */
  z-index: 0;
  height: 360px;
  width: 100%;
  border-radius: 18px;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.03);
}

.map-legend {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  padding: 10px 12px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  color: #334155;
}

.legend-item { display:flex; align-items:center; gap:6px; }
.dot { width:10px; height:10px; border-radius:50%; display:inline-block }
.green-dot { background:#10b981 }
.orange-dot { background:#f59e0b }
.red-dot { background:#ef4444 }
</style>
