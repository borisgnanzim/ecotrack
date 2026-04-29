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
  color: #64748b;
  padding: 6px 10px;
  border-radius: 10px;
  transition: all 0.2s ease;
  position: relative;
}

/* Hover global */
.back-btn:hover {
  color: #059669;
  background: rgba(16, 185, 129, 0.08);
  transform: translateX(-2px);
}

/* Icône animation */
.back-btn svg {
  transition: transform 0.2s ease;
}

.back-btn:hover svg {
  transform: translateX(-3px);
}

/* Active (click feedback) */
.back-btn:active {
  transform: translateX(-1px) scale(0.97);
}

/* Focus (accessibilité) */
.back-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
}

.back-btn::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 10px;
  width: 0%;
  height: 2px;
  background: #10b981;
  transition: width 0.2s ease;
}

.back-btn:hover::after {
  width: calc(100% - 20px);
}
</style>
