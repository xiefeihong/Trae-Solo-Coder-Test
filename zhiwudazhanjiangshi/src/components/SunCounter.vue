<template>
  <div class="sun-counter">
    <span class="sun-icon">☀️</span>
    <span class="sun-count">{{ sunlight }}</span>
  </div>
</template>

<script setup>
defineProps({
  sunlight: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.sun-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(180deg, #fff9c4 0%, #fff176 100%);
  border: 3px solid #fbc02d;
  border-radius: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.sun-icon {
  font-size: 28px;
  animation: sunRotate 10s linear infinite;
}

@keyframes sunRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sun-count {
  font-size: 28px;
  font-weight: bold;
  color: #f57f17;
  min-width: 60px;
  text-align: center;
}
</style>
