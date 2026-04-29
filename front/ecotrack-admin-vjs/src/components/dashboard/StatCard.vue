<template>
  <div class="stat-card">
    <p class="stat-label">{{ label }}</p>

    <div class="stat-value">
      <span :class="color">
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
  background: white;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: 0.2s;
}

/* petit effet hover (très dashboard SaaS) */
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

/* couleurs (équivalent Tailwind) */
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
