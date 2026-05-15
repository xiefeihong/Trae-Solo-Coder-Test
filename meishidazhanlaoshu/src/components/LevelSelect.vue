<script setup lang="ts">
import { LEVELS } from '../config'

const emit = defineEmits<{
  (e: 'select', levelId: number): void
}>()
</script>

<template>
  <div class="level-select">
    <h1>🍔 美食大战老鼠 🧀</h1>
    <p class="subtitle">选择关卡开始游戏</p>
    <div class="level-grid">
      <div
        v-for="level in LEVELS"
        :key="level.id"
        class="level-card"
        @click="emit('select', level.id)"
      >
        <div class="level-number">{{ level.id }}</div>
        <div class="level-name">{{ level.name }}</div>
        <div class="level-info">
          <span>波次: {{ level.waves.length }}</span>
          <span>初始星星: {{ level.startStars }}</span>
        </div>
      </div>
    </div>
    <div class="instructions">
      <h3>🎮 游戏说明</h3>
      <ul>
        <li>点击下方卡片选择食物防御塔</li>
        <li>点击网格放置食物</li>
        <li>点击已放置的食物可以升级、出售或激活</li>
        <li>阻止老鼠到达左侧！</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.level-select {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  background: linear-gradient(180deg, #87CEEB, #90EE90);
}

h1 {
  font-size: 48px;
  color: #8B4513;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 20px;
  color: #666;
  margin-bottom: 40px;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
  margin-bottom: 40px;
}

.level-card {
  background: linear-gradient(145deg, #f5f5dc, #e8e0c8);
  border: 3px solid #8B4513;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.level-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border-color: #FFD700;
}

.level-number {
  font-size: 48px;
  font-weight: bold;
  color: #8B4513;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.level-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.instructions {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 24px 32px;
  max-width: 600px;
}

.instructions h3 {
  color: #8B4513;
  margin-top: 0;
  margin-bottom: 16px;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  padding: 6px 0;
  color: #555;
  font-size: 16px;
}
</style>
