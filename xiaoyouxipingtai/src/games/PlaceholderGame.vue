<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="placeholder-game">
    <font-awesome-icon icon="tools" class="construction-icon" />
    <h2>游戏开发中...</h2>
    <p>这个游戏正在紧张开发中，敬请期待！</p>
    <div class="coming-soon">
      <font-awesome-icon icon="rocket" />
      <span>Coming Soon</span>
    </div>
    <button class="back-btn" @click="emit('close')">
      <font-awesome-icon icon="arrow-left" />
      返回游戏列表
    </button>
  </div>
</template>

<style scoped>
.placeholder-game {
  height: 100%;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 20px;
}

.construction-icon {
  font-size: 5rem;
  color: var(--secondary-color);
  margin-bottom: 25px;
  animation: wiggle 1s infinite;
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.placeholder-game h2 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 15px;
}

.placeholder-game p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
}

.coming-soon {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 30px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.back-btn {
  background: linear-gradient(135deg, var(--primary-color) 0%, #ff8c5a 100%);
  color: white;
  border: none;
  padding: 15px 35px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 20px rgba(255, 107, 53, 0.4);
}

.back-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.5);
}

@media (max-width: 768px) {
  .construction-icon {
    font-size: 3.5rem;
  }
  
  .placeholder-game h2 {
    font-size: 1.5rem;
  }
  
  .placeholder-game p {
    font-size: 0.95rem;
  }
  
  .coming-soon {
    font-size: 1rem;
    padding: 10px 25px;
  }
  
  .back-btn {
    padding: 12px 28px;
    font-size: 1rem;
  }
}
</style>
