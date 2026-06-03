<template>
  <button
    type="button"
    @click="goBack"
    class="back-btn inline-flex items-center gap-2 text-sm font-medium"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>

    {{ label }}

  </button>
</template>

<script>
export default {

  name: "BackButton",

  props: {
    label: {
      type: String,
      default: "Retour"
    }
  },

  methods: {
    goBack() {
      this.$router.back()
    }
  }

}
</script>


<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.34);
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 0.93rem;
  font-weight: 600;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.05);
}

.back-btn:hover {
  color: #0f172a;
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateX(-1px);
}

.back-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

.back-btn:active {
  transform: translateX(-1px) scale(0.98);
}

.back-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
}

.back-btn::after {
  content: "";
  position: absolute;
  bottom: 8px;
  left: 14px;
  width: 0;
  height: 2px;
  background: #10b981;
  border-radius: 999px;
  transition: width 0.2s ease;
}

.back-btn:hover::after {
  width: calc(100% - 28px);
}
</style>
