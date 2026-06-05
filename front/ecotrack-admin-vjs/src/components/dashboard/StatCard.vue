<template>
  <div class="stat-card">
    <div class="stat-card-meta">
      <p class="stat-label">{{ label }}</p>
      <span class="stat-dot" :class="color"></span>
    </div>

    <div class="stat-value">
      <span class="stat-ring" :class="color"></span>
      <span class="stat-number" :class="color">
        {{ value }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  color: String,
})
</script>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 22px 20px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.12);
}

.stat-card::after {
  content: '';
  position: absolute;
  top: -12px;
  right: -12px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(5, 150, 105, 0.08);
  pointer-events: none;
}

.stat-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.stat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 0 8px rgba(255,255,255,0.9);
}

.stat-value {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-ring {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid rgba(0,0,0,0.05);
  position: relative;
}

.stat-ring::before {
  content: '';
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: currentColor;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.text-emerald-600 {
  color: #059669;
}

.text-amber-600 {
  color: #d97706;
}

.text-red-600 {
  color: #dc2626;
}

.text-slate-600 {
  color: #475569;
}
</style>
