<template>
  <div
    class="zombie"
    :class="{ attacking: zombie.isAttacking }"
    :style="{
      left: zombie.x - 40 + 'px',
      top: zombie.y - 40 + 'px'
    }"
  >
    <span class="zombie-emoji">{{ zombie.emoji }}</span>
    <div class="health-bar">
      <div
        class="health-fill"
        :style="{ width: (zombie.health / zombie.maxHealth * 100) + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  zombie: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.zombie {
  position: absolute;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: left 0.05s linear;
}

.zombie.attacking .zombie-emoji {
  animation: zombieAttack 0.3s ease-in-out infinite;
}

@keyframes zombieAttack {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.zombie-emoji {
  font-size: 45px;
  line-height: 1;
  animation: zombieWalk 0.5s ease-in-out infinite;
}

@keyframes zombieWalk {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
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
  background: linear-gradient(90deg, #f44336, #ff9800);
  transition: width 0.2s ease;
}
</style>
