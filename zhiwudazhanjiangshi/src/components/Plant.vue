<template>
  <div
    class="plant"
    :style="{
      left: plant.x - 40 + 'px',
      top: plant.y - 40 + 'px'
    }"
  >
    <span class="plant-emoji">{{ plant.emoji }}</span>
    <div class="health-bar">
      <div
        class="health-fill"
        :style="{ width: (plant.health / plant.maxHealth * 100) + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plant: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.plant {
  position: absolute;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: plantBounce 0.5s ease-out;
}

@keyframes plantBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.plant-emoji {
  font-size: 40px;
  line-height: 1;
}

.health-bar {
  width: 50px;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.2s ease;
}
</style>
