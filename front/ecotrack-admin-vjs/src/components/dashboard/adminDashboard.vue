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
            v-for="card in statsCards"
            :key="card.label"
            :label="card.label"
            :value="card.value"
            :color="card.color"
          />
        </div>
      </section>

      <!-- ANALYTICS -->
      <section class="analytics-section">

        <div class="charts-grid">

          <div class="card chart-card">
            <div class="chart-header">
              <h3>Répartition des déchets</h3>
              <span>100 conteneurs</span>
            </div>

            <div ref="typeChart" class="chart"></div>
          </div>

          <div class="card chart-card">
            <div class="chart-header">
              <h3>État du parc</h3>
              <span>Surveillance temps réel</span>
            </div>

            <div ref="statusChart" class="chart"></div>
          </div>

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
      <section class="card table-card">
        <h2>État des conteneurs</h2>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                  <th>Code</th>
                <th>Zone</th>
                <th>Type</th>
                <th>Capacité</th>
                <th>Remplissage</th>
                <th>Statut</th>
                <th>Ajouté le</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="c in containers" :key="c.id">
                <td class="code">{{ c.code }}</td>
                <td>{{ c.zoneId }}</td>
                <td>{{ c.type }}</td>
                <td>{{ c.capacity }} L</td>

                <!-- Fill -->
                <td>
                  <div class="progress">
                    <div
                      class="progress-bar"
                      :class="fillColor(c.fillLevel)"
                      :style="{ width: (c.fillLevel ?? 0) + '%' }"
                    ></div>
                  </div>
                  <span class="percent">{{ c.fillLevel ?? 0 }}%</span>
                </td>

                <!-- Status -->
                <td>
                  <span :class="statusClass(c.status)">
                    {{ formatTextStatus(c.status) }}
                  </span>
                </td>

                <td class="updated-at">{{ formatDate(c.updatedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>

    </main>
  </div>
</template>

<script>
import AppHeader from "../AppHeader/AppHeader.vue";
import StatCard from "./StatCard.vue";
import containerService from "@/services/container/containerService";
import * as echarts from "echarts";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  name: "DashboardPage",

  components: {
    AppHeader,
    StatCard
  },

  data() {
    return {
      ourStats: {},
      containers: [],

      typeChart: null,
      statusChart: null,
      map: null
    };
  },

  computed: {
    statsCards() {
      return [
        {
          label: "Conteneurs",
          value: this.ourStats.total ?? 0,
          color: "text-emerald-600"
        },

        {
          label: "Normaux",
          value: this.ourStats.statusCount?.normal ?? 0,
          color: "text-green-600"
        },

        {
          label: "Pleins",
          value: this.ourStats.statusCount?.plein ?? 0,
          color: "text-red-600"
        },

        {
          label: "Capacité",
          value: `${(
            this.ourStats.totalCapacity ?? 0
          ).toLocaleString()} L`,
          color: "text-slate-600"
        }
      ];
    }
  },

  async mounted() {
    await this.fetchContainers();
    await this.fetchStats();

    this.$nextTick(() => {
      this.initMap();
      this.initCharts();
    });
  },

  beforeUnmount() {
    this.typeChart?.dispose();
    this.statusChart?.dispose();
    this.map?.remove();
  },

  methods: {

    async fetchContainers() {
      try {
        const response = await containerService.getAll();
        this.containers = response.data || [];
      } catch (error) {
        console.error("Erreur récupération des conteneurs :", error);
        this.containers = [];
      }
    },

    async fetchStats() {
      try {
        const response = await containerService.getStats();
        this.ourStats = response.data || {};
      } catch (error) {
        console.error("Erreur récupération statistiques :", error);
        this.ourStats = {};
      }
    },

    fillColor(value) {
      if (value < 70) return "green";
      if (value < 90) return "orange";
      return "red";
    },

    statusClass(status) {
      return {
        badge: true,
        ok: status === "normal" || status === "OK",
        alert: status === "plein" || status === "ALERTE",
        urgent:
          status === "en_maintenance" ||
          status === "URGENT"
      };
    },

    formatDate(date) {
      if (!date) return "-";

      return new Date(date).toLocaleDateString("fr-FR");
    },

    formatTextStatus(status) {
      switch (status) {
        case "normal":
        case "OK":
          return "Normal";

        case "plein":
        case "ALERTE":
          return "Plein";

        case "en_maintenance":
        case "maintenance":
          return "En maintenance";

        case "desactive":
        case "disabled":
          return "Désactivé";

        default:
          return status;
      }
    },

    initCharts() {
      this.initTypeChart();
      this.initStatusChart();

      window.addEventListener("resize", () => {
        this.typeChart?.resize();
        this.statusChart?.resize();
      });
    },

    initTypeChart() {

      const data = Object.entries(
        this.ourStats.parType || {}
      ).map(([name, value]) => ({
        name:
          name.charAt(0).toUpperCase() +
          name.slice(1),
        value
      }));

      const chart = echarts.init(
        this.$refs.typeChart
      );

      chart.setOption({
        tooltip: {
          trigger: "item"
        },

        legend: {
          bottom: 0
        },

        series: [
          {
            name: "Types",
            type: "pie",
            radius: ["45%", "75%"],

            label: {
              formatter: "{b}\n{d}%"
            },

            data
          }
        ]
      });

      this.typeChart = chart;
    },

    initStatusChart() {

      const stats = this.ourStats.statusCount || {};

      const chart = echarts.init(
        this.$refs.statusChart
      );

      chart.setOption({
        tooltip: {
          trigger: "axis"
        },

        grid: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
          containLabel: true
        },

        xAxis: {
          type: "value"
        },

        yAxis: {
          type: "category",
          data: [
            "Normal",
            "Maintenance",
            "Désactivé",
            "Plein"
          ]
        },

        series: [
          {
            type: "bar",
            barWidth: 18,

            data: [
              {
                value: stats.normal || 0,
                itemStyle: {
                  color: "#10b981"
                }
              },

              {
                value:
                  stats.en_maintenance || 0,
                itemStyle: {
                  color: "#3b82f6"
                }
              },

              {
                value: stats.desactive || 0,
                itemStyle: {
                  color: "#64748b"
                }
              },

              {
                value: stats.plein || 0,
                itemStyle: {
                  color: "#ef4444"
                }
              }
            ]
          }
        ]
      });

      this.statusChart = chart;
    },

    initMap() {

      const center = [48.8566, 2.3522];

      const map = L.map("map").setView(
        center,
        12
      );

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            "&copy; OpenStreetMap contributors"
        }
      ).addTo(map);

      setTimeout(
        () => map.invalidateSize(),
        0
      );

      const latlngs = [];

      this.containers.forEach((c) => {

        if (!c.latitude || !c.longitude) {
          return;
        }

        const fill = c.fillLevel ?? 0;

        const color =
          fill < 70
            ? "#10b981"
            : fill < 90
            ? "#f59e0b"
            : "#ef4444";

        latlngs.push([
          c.latitude,
          c.longitude
        ]);

        const marker = L.marker(
          [c.latitude, c.longitude],
          {
            icon: L.divIcon({
              className: "container-marker",

              html: `
                <div class="marker-wrapper">
                  <div class="radar radar-1" style="color:${color}"></div>
                  <div class="radar radar-2" style="color:${color}"></div>
                  <div class="radar radar-3" style="color:${color}"></div>

                  <div
                    class="marker-core"
                    style="
                      background:${color};
                      color:${color};
                    "
                  ></div>
                </div>
              `,

              iconSize: [40, 40],
              iconAnchor: [20, 20]
            })
          }
        ).addTo(map);

        marker.bindPopup(`
          <div style="font-weight:600;">
            ${c.code}
          </div>

          <div style="margin-top:6px;">
            ${c.type}
          </div>

          <div>
            Remplissage :
            <strong>${fill}%</strong>
          </div>
        `);
      });

      if (latlngs.length) {
        map.fitBounds(
          L.latLngBounds(latlngs),
          {
            padding: [50, 50],
            maxZoom: 15
          }
        );
      }

      this.map = map;
    }
  }
};
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

  transition:
    transform .35s ease,
    box-shadow .35s ease;
}

.card:hover {
  transform: translateY(-1px) scale(1.01);

  box-shadow:
    0 30px 60px rgba(15, 23, 42, 0.10);
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
.map-card,
.table-card {
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease;
}

.map-card:hover,
.table-card:hover {
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
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

  border-radius: 999px;

  overflow: hidden;

  position: relative;
}

.progress-bar {
  height: 100%;
  position: relative;
}

.progress-bar::after {
  content: "";

  position: absolute;

  top: 0;
  left: -100%;

  width: 100%;
  height: 100%;

  background: rgba(255,255,255,.35);

  animation: shimmer 2.2s infinite;
}

@keyframes shimmer {
  from {
    left: -100%;
  }

  to {
    left: 150%;
  }
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

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stats-header-small {
  margin-bottom: 14px;
}

.section-title-sm {
  margin: 4px 0 0;
  font-size: 16px;
}

.map {
  position: relative;
  z-index: 0;

  height: 420px;
  width: 100%;

  border-radius: 18px;

  overflow: hidden;

  box-shadow:
    inset 0 0 0 1px rgba(15,23,42,.04);
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

.table-wrapper {
  max-height: 520px;
  overflow-y: auto;

  margin-top: 16px;

  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.table-wrapper::-webkit-scrollbar {
  width: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.table thead th {
  position: sticky;
  top: 0;

  z-index: 20;

  background: white;

  border-bottom: 1px solid #e2e8f0;
}

.table tbody tr {
  transition:
    background .25s ease,
    transform .25s ease;
}

.table tbody tr:hover {
  background: #f8fafc;
  transform: scale(1.005);
}

.table tbody tr:hover {
  background: #f8fafc;
  transform: scale(1.005);
}

/* CSS DES GRAPHIQUES */
.analytics-section {
  margin-top: 24px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  padding: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;

  font-size: 18px;
  font-weight: 700;

  color: #0f172a;
}

.chart-header span {
  font-size: 13px;
  color: #64748b;
}

.chart {
  width: 100%;
  height: 360px;
}

@media (max-width: 900px) {

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 300px;
  }

}

.stats-grid .card {
  position: relative;
  overflow: hidden;
}

.stats-grid .card::before {
  content: "";

  position: absolute;

  top: 0;
  left: 0;

  width: 4px;
  height: 100%;

  background: #10b981;
}
</style>

<style>
/* =========================
   LEAFLET CONTAINER MARKERS
   ========================= */

.container-marker {
  background: transparent !important;
  border: none !important;
  transition:
    transform .3s ease,
    filter .3s ease;
}

.container-marker:hover {
  transform: scale(1.35);
  filter: brightness(1.15);
  z-index: 9999;
}

.marker-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}

.marker-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, -50%);
  z-index: 10;

  box-shadow:
    0 0 0 6px rgba(255,255,255,.25),
    0 0 15px currentColor,
    0 0 25px currentColor;

  animation:
    corePulse 2s infinite ease-in-out,
    floatMarker 3s infinite ease-in-out;
}

.radar {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 2px solid currentColor;
  transform: translate(-50%, -50%);
  opacity: 0;
}

.radar-1 {
  animation: radarPulse 2s infinite;
}

.radar-2 {
  animation: radarPulse 2s infinite .7s;
}

.radar-3 {
  animation: radarPulse 2s infinite 1.4s;
}

@keyframes radarPulse {
  0% {
    width: 14px;
    height: 14px;
    opacity: .9;
  }

  100% {
    width: 70px;
    height: 70px;
    opacity: 0;
  }
}

@keyframes corePulse {
  0%,100% {
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    transform: translate(-50%, -50%) scale(1.25);
  }
}

@keyframes floatMarker {
  0%,100% {
    margin-top: 0;
  }

  50% {
    margin-top: -4px;
  }
}
</style>
